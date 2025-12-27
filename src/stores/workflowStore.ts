import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  WorkflowNode, 
  WorkflowEdge, 
  ExecutionState,
  ExecutionLog
} from '@/types/workflow'

import { validateCompleteWorkflow } from '@/utils/validation'
import { 
  startWorkflowExecution,
  pauseWorkflowExecution,
  resumeWorkflowExecution,
  stopWorkflowExecution,
  type ExecutionContext
} from '@/utils/execution'
import {
  saveWorkflowToStorage,
  loadWorkflowFromStorage,
  exportWorkflowToJson,
  importWorkflowFromJson
} from '@/utils/persistence'
import {
  createSnapshot,
  addToHistory,
  undo as performUndo,
  redo as performRedo,
  canUndo as checkCanUndo,
  canRedo as checkCanRedo,
  clearHistory,
  type HistoryState
} from '@/utils/history'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<WorkflowEdge[]>([])
  const selectedNode = ref<WorkflowNode | null>(null)
  
  // History state
  const historyState = ref<HistoryState>({
    snapshots: [],
    currentIndex: -1
  })
  
  // Execution state
  const executionState = ref<ExecutionState>({
    isRunning: false,
    isPaused: false,
    currentNodeId: null,
    logs: [],
    nodeStatuses: {}
  })
  
  const canUndo = computed(() => checkCanUndo(historyState.value))
  const canRedo = computed(() => checkCanRedo(historyState.value))
  const nodeCount = computed(() => nodes.value.length)
  const edgeCount = computed(() => edges.value.length)
  
  function saveToHistory() {
    const snapshot = createSnapshot(nodes.value, edges.value)
    historyState.value = addToHistory(historyState.value, snapshot)
  }

  /**
   * Adds a new node to the workflow
   */
  function addNode(nodeData: Partial<WorkflowNode> & { 
    data: { 
      label: string
      nodeType: 'trigger' | 'action' | 'logic'
      icon: string
    } 
  }): WorkflowNode {
    
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newNode: WorkflowNode = {
      id,
      type: 'custom',
      position: nodeData.position || { x: 100, y: 100 },
      data: {
        label: nodeData.data.label,
        nodeType: nodeData.data.nodeType,
        config: nodeData.data.config || {},
        icon: nodeData.data.icon
      }
    }
    
    nodes.value.push(newNode)
    saveToHistory()
    return newNode
  }

  /**
   * Removes a node from the workflow
   */
  function removeNode(nodeId: string) {
    
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)
    
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null
    }
    
    saveToHistory()
  }

  /**
   * Updates a node's data
   */
  function updateNode(nodeId: string, updates: Partial<WorkflowNode['data']>) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      
      Object.assign(node.data, updates)
      saveToHistory()
      saveWorkflow()
      
      console.log('localStorage saved')
    } else {
      console.error('Node not found:', nodeId)
    }
  }

  /**
   * Updates a node's position
   */
  function updateNodePosition(nodeId: string, position: { x: number; y: number }) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.position = position
    }
  }

  /**
   * Duplicates an existing node
   */
  function duplicateNode(nodeId: string) {
    
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      addNode({
        ...node,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50
        }
      })
    }
  }
  
  /**
   * Adds a new edge to the workflow
   */
  function addEdge(edgeData: Partial<WorkflowEdge> & { source: string; target: string }) {

    const id = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newEdge: WorkflowEdge = {
      id,
      source: edgeData.source,
      target: edgeData.target,
      type: 'smoothstep',
      animated: true,
      label: edgeData.label,
      ...edgeData
    }
    
    edges.value.push(newEdge)
    saveToHistory()
  }

  /**
   * Removes an edge from the workflow
   */
  function removeEdge(edgeId: string) {
    edges.value = edges.value.filter(e => e.id !== edgeId)
    saveToHistory()
  }

  /**
   * Updates an edge's properties
   */
  function updateEdge(edgeId: string, updates: Partial<WorkflowEdge>) {
    const edge = edges.value.find(e => e.id === edgeId)
    if (edge) {
      Object.assign(edge, updates)
    }
  }
  
  /**
   * Undo last action
   */
  function undo() {
    const snapshot = performUndo(historyState.value)
    if (snapshot) {
      nodes.value = snapshot.nodes
      edges.value = snapshot.edges
    }
  }

  /**
   * Redo last undone action
   */
  function redo() {
    const snapshot = performRedo(historyState.value)
    if (snapshot) {
      nodes.value = snapshot.nodes
      edges.value = snapshot.edges
    }
  }
  
  /**
   * Saves workflow to localStorage
   */
  function saveWorkflow() {
    return saveWorkflowToStorage(nodes.value, edges.value)
  }

  /**
   * Loads workflow from localStorage
   */
  function loadWorkflow() {
    const workflow = loadWorkflowFromStorage()
    if (workflow) {
      nodes.value = workflow.nodes
      edges.value = workflow.edges
      saveToHistory()
      console.log('Workflow loaded')
    }
  }

  /**
   * Clears current workflow
   */
  function clearWorkflow() {
    console.log('Clearing workflow...')
    
    nodes.value = []
    edges.value = []
    selectedNode.value = null
    historyState.value = clearHistory(historyState.value)
    saveToHistory()
  }

  /**
   * Exports workflow to JSON
   */
  function exportWorkflow(): string {
    return exportWorkflowToJson(nodes.value, edges.value)
  }

  /**
   * Imports workflow from JSON
   */
  function importWorkflow(jsonString: string) {
    const workflow = importWorkflowFromJson(jsonString)
    nodes.value = workflow.nodes
    edges.value = workflow.edges
    saveToHistory()
  }
  
  /**
   * Validates workflow
   */
  function validateWorkflow(): { valid: boolean; errors: string[] } {
    return validateCompleteWorkflow(nodes.value)
  }
  
  /**
   * Adds a log entry
   */
  function addLog(log: Omit<ExecutionLog, 'timestamp'>) {
    executionState.value.logs.push({
      ...log,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Starts workflow execution
   */
  async function startExecution() {
    // Validate before execution
    const validation = validateWorkflow()
    if (!validation.valid) {
      executionState.value.logs = []
      validation.errors.forEach(error => {
        addLog({ type: 'error', message: error })
      })
      return
    }

    // Create execution context
    const context: ExecutionContext = {
      nodes: nodes.value,
      edges: edges.value,
      executionState: executionState.value,
      onLog: addLog,
      onStatusChange: (nodeId, status) => {
        executionState.value.nodeStatuses[nodeId] = status
        if (status === 'running') {
          executionState.value.currentNodeId = nodeId
        }
      }
    }

    // Start execution using utility
    await startWorkflowExecution(context)
  }

  /**
   * Pauses execution
   */
  function pauseExecution() {
    pauseWorkflowExecution(executionState.value, addLog)
  }

  /**
   * Resumes execution
   */
  function resumeExecution() {
    resumeWorkflowExecution(executionState.value, addLog)
  }

  /**
   * Stops execution
   */
  function stopExecution() {
    stopWorkflowExecution(executionState.value, addLog)
  }

  /**
   * Clears execution logs
   */
  function clearLogs() {
    executionState.value.logs = []
  }
  
  /**
   * Selects a node
   */
  function selectNode(node: WorkflowNode | null) {
    selectedNode.value = node
  }
  
  return {
    // State
    nodes,
    edges,
    selectedNode,
    history: computed(() => historyState.value.snapshots),
    historyIndex: computed(() => historyState.value.currentIndex),
    executionState,

    // Computed
    canUndo,
    canRedo,
    nodeCount,
    edgeCount,

    // Actions
    addNode,
    removeNode,
    updateNode,
    updateNodePosition,
    duplicateNode,
    addEdge,
    removeEdge,
    updateEdge,
    undo,
    redo,
    saveWorkflow,
    loadWorkflow,
    clearWorkflow,
    exportWorkflow,
    importWorkflow,
    validateWorkflow,
    startExecution,
    pauseExecution,
    resumeExecution,
    stopExecution,
    clearLogs,
    selectNode
  }
})