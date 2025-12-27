import type { WorkflowNode, WorkflowEdge } from '@/types/workflow'
import { STORAGE_KEYS } from '@/constants/nodeTypes'

export interface WorkflowData {
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
    timestamp: number
}

export interface ExportedWorkflow extends WorkflowData {
    version: string
    metadata: {
        exportedAt: string
        nodeCount: number
        edgeCount: number
    }
}

/**
 * Saves workflow to localStorage
 * @param nodes - Array of workflow nodes
 * @param edges - Array of workflow edges
 * @returns Saved workflow data
 */
export function saveWorkflowToStorage(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
): WorkflowData {
    const workflow: WorkflowData = {
        nodes,
        edges,
        timestamp: Date.now()
    }

    try {
        const workflowJson = JSON.stringify(workflow)
        localStorage.setItem(STORAGE_KEYS.WORKFLOW, workflowJson)
        return workflow
    } catch (error) {
        throw new Error(`Failed to save workflow: ${error}`)
    }
}

/**
 * Loads workflow from localStorage
 * @returns Loaded workflow data or null if not found
 */
export function loadWorkflowFromStorage(): WorkflowData | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.WORKFLOW)

        if (!saved) {
            return null
        }
        const workflow = JSON.parse(saved) as WorkflowData

        return workflow
    } catch (error) {
        return null
    }
}

/**
 * Clears workflow from localStorage
 */
export function clearWorkflowFromStorage(): void {

    try {
        localStorage.removeItem(STORAGE_KEYS.WORKFLOW)
    } catch (error) {
        console.error('Failed to clear workflow:', error)
    }
}

/**
 * Checks if workflow exists in localStorage
 * @returns True if workflow exists
 */
export function hasStoredWorkflow(): boolean {
    return localStorage.getItem(STORAGE_KEYS.WORKFLOW) !== null
}

/**
 * Gets storage size in bytes
 * @returns Storage size or 0 if error
 */
export function getStorageSize(): number {
    try {
        const workflow = localStorage.getItem(STORAGE_KEYS.WORKFLOW)
        return workflow ? workflow.length : 0
    } catch {
        return 0
    }
}

/**
 * Exports workflow to JSON string
 * @param nodes - Array of workflow nodes
 * @param edges - Array of workflow edges
 * @returns JSON string of exported workflow
 */
export function exportWorkflowToJson(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
): string {

    const exportedWorkflow: ExportedWorkflow = {
        version: '1.0.0',
        nodes,
        edges,
        timestamp: Date.now(),
        metadata: {
            exportedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
        }
    }

    const json = JSON.stringify(exportedWorkflow, null, 2)

    return json
}

/**
 * Imports workflow from JSON string
 * @param jsonString - JSON string of workflow
 * @returns Imported workflow data
 * @throws Error if JSON is invalid
 */
export function importWorkflowFromJson(jsonString: string): WorkflowData {
    try {
        const workflow = JSON.parse(jsonString)

        // Validate required fields
        if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
            throw new Error('Invalid workflow format: missing or invalid nodes')
        }
        if (!workflow.edges || !Array.isArray(workflow.edges)) {
            throw new Error('Invalid workflow format: missing or invalid edges')
        }
        return {
            nodes: workflow.nodes,
            edges: workflow.edges,
            timestamp: workflow.timestamp || Date.now()
        }
    } catch (error) {
        throw new Error(`Invalid workflow format: ${error}`)
    }
}


/**
 * Creates a backup of current workflow
 * @param nodes - Array of workflow nodes
 * @param edges - Array of workflow edges
 * @param backupKey - Optional custom backup key
 */
export function createBackup(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    backupKey?: string
): void {
    const key = backupKey || `${STORAGE_KEYS.WORKFLOW}_backup_${Date.now()}`


    const workflow: WorkflowData = {
        nodes,
        edges,
        timestamp: Date.now()
    }

    try {
        localStorage.setItem(key, JSON.stringify(workflow))
    } catch (error) {
        console.error('Failed to create backup:', error)
    }
}

/**
 * Lists all available backups
 * @returns Array of backup keys
 */
export function listBackups(): string[] {
    const backups: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`${STORAGE_KEYS.WORKFLOW}_backup_`)) {
            backups.push(key)
        }
    }
    return backups
}

/**
 * Restores workflow from backup
 * @param backupKey - Backup key to restore
 * @returns Restored workflow data or null
 */
export function restoreBackup(backupKey: string): WorkflowData | null {

    try {
        const saved = localStorage.getItem(backupKey)
        if (!saved) {
            return null
        }

        const workflow = JSON.parse(saved) as WorkflowData
        return workflow
    } catch (error) {
        return null
    }
}

/**
 * Deletes a backup
 * @param backupKey - Backup key to delete
 */
export function deleteBackup(backupKey: string): void {

    try {
        localStorage.removeItem(backupKey)
    } catch (error) {
    }
}


let saveTimeout: NodeJS.Timeout | null = null

/**
 * Saves workflow with debouncing
 * Useful for auto-save scenarios to avoid excessive writes
 * @param nodes - Array of workflow nodes
 * @param edges - Array of workflow edges
 * @param delay - Debounce delay in milliseconds (default: 1000)
 */
export function debouncedSave(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    delay = 1000
): void {
    if (saveTimeout) {
        clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
        saveWorkflowToStorage(nodes, edges)
    }, delay)
}

/**
 * Cancels pending debounced save
 */
export function cancelDebouncedSave(): void {
    if (saveTimeout) {
        clearTimeout(saveTimeout)
        saveTimeout = null
    }
}