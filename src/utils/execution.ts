import type { WorkflowNode, WorkflowEdge, ExecutionState, ExecutionLog } from '@/types/workflow'
import { EXECUTION_DELAY } from '@/constants/nodeTypes'

export interface ExecutionContext {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  executionState: ExecutionState
  onLog: (log: Omit<ExecutionLog, 'timestamp'>) => void
  onStatusChange: (nodeId: string, status: 'running' | 'success' | 'error') => void
}

export interface ExecutionResult {
  success: boolean
  error?: string
  executedNodes: string[]
}

/**
 * Finds trigger node in workflow
 * @param nodes - Array of workflow nodes
 * @returns Trigger node or null
 */
export function findTriggerNode(nodes: WorkflowNode[]): WorkflowNode | null {
  return nodes.find(n => n.data.nodeType === 'trigger') || null
}

/**
 * Finds next nodes connected to given node
 * @param nodeId - Source node ID
 * @param edges - Array of workflow edges
 * @returns Array of target node IDs
 */
export function findNextNodes(nodeId: string, edges: WorkflowEdge[]): string[] {
  return edges
    .filter(e => e.source === nodeId)
    .map(e => e.target)
}

/**
 * Gets node by ID
 * @param nodeId - Node ID to find
 * @param nodes - Array of workflow nodes
 * @returns Node or null
 */
export function getNodeById(nodeId: string, nodes: WorkflowNode[]): WorkflowNode | null {
  return nodes.find(n => n.id === nodeId) || null
}

/**
 * Initializes execution state
 * @param executionState - Current execution state
 */
export function initializeExecution(executionState: ExecutionState): void {
  executionState.isRunning = true
  executionState.isPaused = false
  executionState.logs = []
  executionState.nodeStatuses = {}
  executionState.currentNodeId = null
}

/**
 * Cleans up execution state
 * @param executionState - Current execution state
 */
export function cleanupExecution(executionState: ExecutionState): void {
  executionState.isRunning = false
  executionState.isPaused = false
  executionState.currentNodeId = null
}

/**
 * Executes a single node
 * @param nodeId - Node ID to execute
 * @param context - Execution context
 * @returns Execution success status
 */
export async function executeNode(
  nodeId: string,
  context: ExecutionContext
): Promise<boolean> {
  const { nodes, executionState, onLog, onStatusChange } = context

  // Check if execution is still running
  if (!executionState.isRunning) {
    return false
  }

  // Find node
  const node = getNodeById(nodeId, nodes)
  if (!node) {
    onLog({ type: 'error', message: `Node not found: ${nodeId}` })
    return false
  }

  // Mark as running
  executionState.currentNodeId = nodeId
  onStatusChange(nodeId, 'running')
  onLog({
    type: 'info',
    message: `⚡ Executing: ${node.data.label} (${node.id})`
  })

  try {
    // Simulate execution delay (would be replaced with actual node execution logic)
    await new Promise(resolve => setTimeout(resolve, EXECUTION_DELAY))

    // TODO: Replace with actual node execution based on node type
    // await executeNodeLogic(node, context)

    // Mark as success
    onStatusChange(nodeId, 'success')
    onLog({
      type: 'success',
      message: `✅ Completed: ${node.data.label}`
    })

    return true
  } catch (error) {
    
    onStatusChange(nodeId, 'error')
    onLog({
      type: 'error',
      message: `❌ Error in ${node.data.label}: ${error}`
    })

    return false
  }
}

/**
 * Executes workflow starting from a specific node
 * Uses depth-first traversal
 * @param startNodeId - Node ID to start execution from
 * @param context - Execution context
 * @param executedNodes - Set of already executed nodes (prevents cycles)
 * @returns Execution result
 */
export async function executeWorkflowFromNode(
  startNodeId: string,
  context: ExecutionContext,
  executedNodes: Set<string> = new Set()
): Promise<ExecutionResult> {
  const { edges, executionState } = context

  // Prevent infinite loops
  if (executedNodes.has(startNodeId)) {
    return {
      success: true,
      executedNodes: Array.from(executedNodes)
    }
  }

  // Execute current node
  const success = await executeNode(startNodeId, context)
  if (!success) {
    return {
      success: false,
      error: `Failed to execute node: ${startNodeId}`,
      executedNodes: Array.from(executedNodes)
    }
  }

  // Mark as executed
  executedNodes.add(startNodeId)

  // Check if execution should continue
  if (!executionState.isRunning) {
    return {
      success: false,
      error: 'Execution stopped by user',
      executedNodes: Array.from(executedNodes)
    }
  }

  // Find and execute next nodes
  const nextNodeIds = findNextNodes(startNodeId, edges)
  
  if (nextNodeIds.length === 0) {
    return {
      success: true,
      executedNodes: Array.from(executedNodes)
    }
  }

  // Execute all next nodes sequentially
  for (const nextNodeId of nextNodeIds) {
    if (!executionState.isRunning) break

    const result = await executeWorkflowFromNode(nextNodeId, context, executedNodes)
    
    if (!result.success) {
      return result
    }
  }

  return {
    success: true,
    executedNodes: Array.from(executedNodes)
  }
}

/**
 * Starts workflow execution
 * Handles initialization, validation, execution, and cleanup
 * @param context - Execution context
 * @returns Execution result
 */
export async function startWorkflowExecution(
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { nodes, executionState, onLog } = context
  // Check if already running
  if (executionState.isRunning) {
    return {
      success: false,
      error: 'Execution already in progress',
      executedNodes: []
    }
  }

  // Initialize execution state
  initializeExecution(executionState)

  try {
    // Find trigger node
    const triggerNode = findTriggerNode(nodes)
    
    if (!triggerNode) {
      const error = 'No trigger node found. Please add a trigger node (Manual or Webhook) to start the workflow.'
      onLog({ type: 'error', message: `❌ ${error}` })
      
      return {
        success: false,
        error,
        executedNodes: []
      }
    }
    onLog({
      type: 'info',
      message: `🚀 Starting workflow execution from: ${triggerNode.data.label}`
    })

    // Execute workflow from trigger node
    const result = await executeWorkflowFromNode(triggerNode.id, context)

    if (result.success) {
      onLog({
        type: 'success',
        message: `✅ Workflow execution completed successfully (${result.executedNodes.length} nodes)`
      })
    } else {
      onLog({
        type: 'error',
        message: `❌ Workflow execution failed: ${result.error}`
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    onLog({
      type: 'error',
      message: `❌ Workflow execution failed: ${errorMessage}`
    })

    return {
      success: false,
      error: errorMessage,
      executedNodes: []
    }
  } finally {
    // Cleanup
    cleanupExecution(executionState)
  }
}

/**
 * Pauses workflow execution
 * @param executionState - Current execution state
 * @param onLog - Log callback
 */
export function pauseWorkflowExecution(
  executionState: ExecutionState,
  onLog: (log: Omit<ExecutionLog, 'timestamp'>) => void
): void {
  executionState.isPaused = true
  onLog({ type: 'warning', message: '⏸️ Execution paused' })
}

/**
 * Resumes workflow execution
 * @param executionState - Current execution state
 * @param onLog - Log callback
 */
export function resumeWorkflowExecution(
  executionState: ExecutionState,
  onLog: (log: Omit<ExecutionLog, 'timestamp'>) => void
): void {
  executionState.isPaused = false
  onLog({ type: 'info', message: '▶️ Execution resumed' })
}

/**
 * Stops workflow execution
 * @param executionState - Current execution state
 * @param onLog - Log callback
 */
export function stopWorkflowExecution(
  executionState: ExecutionState,
  onLog: (log: Omit<ExecutionLog, 'timestamp'>) => void
): void {
  executionState.isRunning = false
  executionState.isPaused = false
  executionState.currentNodeId = null
  onLog({ type: 'warning', message: '⏹️ Execution stopped by user' })
}