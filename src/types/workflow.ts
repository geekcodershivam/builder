import { Node, Edge } from '@vue-flow/core'

export type NodeType = 'trigger' | 'action' | 'logic'

export type NodeConfigValue =
  | string
  | number
  | boolean
  | object
  | undefined

export interface NodeConfig {
  [key: string]: NodeConfigValue

  // HTTP Request
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: string
  body?: string

  // Email
  to?: string
  subject?: string

  // SMS
  message?: string

  // Condition
  expression?: string
  trueLabel?: string
  falseLabel?: string

  // Transform
  script?: string
}
export interface WorkflowNodeData {
  label: string
  nodeType: NodeType
  icon: string
  config: NodeConfig | any
}

export interface WorkflowNode extends Node {
  data: WorkflowNodeData
}

export interface WorkflowEdge extends Edge {
  id: string
  source: string
  target: string
  label: string
  type: string
  animated: boolean
}

export interface WorkflowSnapshot {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface ExecutionLog {
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  timestamp: string
}

export interface ExecutionState {
  isRunning: boolean
  isPaused: boolean
  currentNodeId: string | null
  logs: ExecutionLog[]
  nodeStatuses: Record<string, 'running' | 'success' | 'error' | 'pending' | 'skipped'>
}

export interface NodeTypeDefinition {
  type: string
  label: string
  icon: string
  color: string
  category: 'trigger' | 'action' | 'logic'
  config: NodeConfig
  description?: string
}

export interface WorkflowMetadata {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  version: string
}
