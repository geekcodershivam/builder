
import type { WorkflowNode, WorkflowEdge, WorkflowSnapshot } from '@/types/workflow'
import { HISTORY_LIMIT } from '@/constants/nodeTypes'

export interface HistoryState {
    snapshots: WorkflowSnapshot[]
    currentIndex: number
}

export interface HistoryInfo {
    currentIndex: number
    totalSnapshots: number
    canUndo: boolean
    canRedo: boolean
    memoryUsage: string
}


/**
 * Creates a deep copy snapshot of current workflow state
 * @param nodes - Array of workflow nodes
 * @param edges - Array of workflow edges
 * @returns Workflow snapshot
 */
export function createSnapshot(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
): WorkflowSnapshot {

    // Deep clone to prevent reference issues
    const snapshot: WorkflowSnapshot = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
    }

    return snapshot
}

/**
 * Calculates memory usage of snapshot
 * @param snapshot - Workflow snapshot
 * @returns Memory size in KB
 */
export function getSnapshotSize(snapshot: WorkflowSnapshot): number {
    const jsonString = JSON.stringify(snapshot)
    return jsonString.length / 1024 // Size in KB
}

/**
 * Adds a new snapshot to history
 * Handles:
 * - Removing future history if not at end
 * - Enforcing history size limits
 * - Memory optimization
 * 
 * @param history - Current history state
 * @param snapshot - New snapshot to add
 * @returns Updated history state
 */
export function addToHistory(
    history: HistoryState,
    snapshot: WorkflowSnapshot
): HistoryState {
    // Remove any future history if we're not at the end
    if (history.currentIndex < history.snapshots.length - 1) {
        history.snapshots.length - history.currentIndex - 1
        history.snapshots = history.snapshots.slice(0, history.currentIndex + 1)
    }

    // Add new snapshot
    history.snapshots.push(snapshot)
    history.currentIndex++

    // Enforce history limit
    if (history.snapshots.length > HISTORY_LIMIT) {
        history.snapshots.shift()
        history.currentIndex--
    }

    return history
}

/**
 * Performs undo operation
 * @param history - Current history state
 * @returns Previous snapshot or null if can't undo
 */
export function undo(history: HistoryState): WorkflowSnapshot | null {

    if (history.currentIndex <= 0) {
        return null
    }

    history.currentIndex--
    const snapshot = history.snapshots[history.currentIndex]
    // Return deep copy to prevent mutations
    return JSON.parse(JSON.stringify(snapshot))
}

/**
 * Performs redo operation
 * @param history - Current history state
 * @returns Next snapshot or null if can't redo
 */
export function redo(history: HistoryState): WorkflowSnapshot | null {

    if (history.currentIndex >= history.snapshots.length - 1) {
        return null
    }

    history.currentIndex++
    const snapshot = history.snapshots[history.currentIndex]

    // Return deep copy to prevent mutations
    return JSON.parse(JSON.stringify(snapshot))
}

/**
 * Checks if undo is available
 * @param history - Current history state
 * @returns True if can undo
 */
export function canUndo(history: HistoryState): boolean {
    return history.currentIndex > 0
}

/**
 * Checks if redo is available
 * @param history - Current history state
 * @returns True if can redo
 */
export function canRedo(history: HistoryState): boolean {
    return history.currentIndex < history.snapshots.length - 1
}


/**
 * Gets detailed history information
 * @param history - Current history state
 * @returns History information
 */
export function getHistoryInfo(history: HistoryState): HistoryInfo {
    // Calculate total memory usage
    let totalSize = 0
    for (const snapshot of history.snapshots) {
        totalSize += getSnapshotSize(snapshot)
    }

    return {
        currentIndex: history.currentIndex,
        totalSnapshots: history.snapshots.length,
        canUndo: canUndo(history),
        canRedo: canRedo(history),
        memoryUsage: `${totalSize.toFixed(2)} KB`
    }
}

/**
 * Clears all history
 * @param history - Current history state
 * @returns Reset history state
 */
export function clearHistory(history: HistoryState): HistoryState {
    history.snapshots = []
    history.currentIndex = -1
    return history
}

/**
 * Optimizes history by removing old snapshots beyond a threshold
 * @param history - Current history state
 * @param keepCount - Number of recent snapshots to keep
 * @returns Optimized history state
 */
export function optimizeHistory(
    history: HistoryState,
    keepCount: number = HISTORY_LIMIT
): HistoryState {
    if (history.snapshots.length <= keepCount) {
        return history
    }

    history.snapshots.length - keepCount
    history.snapshots = history.snapshots.slice(-keepCount)
    history.currentIndex = Math.min(history.currentIndex, history.snapshots.length - 1)

    return history
}

/**
 * Compares two snapshots to determine what changed
 * @param oldSnapshot - Previous snapshot
 * @param newSnapshot - New snapshot
 * @returns Change summary
 */
export function compareSnapshots(
    oldSnapshot: WorkflowSnapshot,
    newSnapshot: WorkflowSnapshot
): {
    nodesAdded: number
    nodesRemoved: number
    nodesModified: number
    edgesAdded: number
    edgesRemoved: number
} {
    const oldNodeIds = new Set(oldSnapshot.nodes.map(n => n.id))
    const newNodeIds = new Set(newSnapshot.nodes.map(n => n.id))

    const oldEdgeIds = new Set(oldSnapshot.edges.map(e => e.id))
    const newEdgeIds = new Set(newSnapshot.edges.map(e => e.id))

    // Nodes
    const nodesAdded = newSnapshot.nodes.filter(n => !oldNodeIds.has(n.id)).length
    const nodesRemoved = oldSnapshot.nodes.filter(n => !newNodeIds.has(n.id)).length

    // Check for modified nodes (same ID but different data)
    const commonNodeIds = oldSnapshot.nodes.filter(n => newNodeIds.has(n.id)).map(n => n.id)
    let nodesModified = 0
    for (const id of commonNodeIds) {
        const oldNode = oldSnapshot.nodes.find(n => n.id === id)
        const newNode = newSnapshot.nodes.find(n => n.id === id)
        if (JSON.stringify(oldNode) !== JSON.stringify(newNode)) {
            nodesModified++
        }
    }

    // Edges
    const edgesAdded = newSnapshot.edges.filter(e => !oldEdgeIds.has(e.id)).length
    const edgesRemoved = oldSnapshot.edges.filter(e => !newEdgeIds.has(e.id)).length

    return {
        nodesAdded,
        nodesRemoved,
        nodesModified,
        edgesAdded,
        edgesRemoved
    }
}

/**
 * Gets a human-readable description of changes between snapshots
 * @param oldSnapshot - Previous snapshot
 * @param newSnapshot - New snapshot
 * @returns Change description
 */
export function getChangeDescription(
    oldSnapshot: WorkflowSnapshot,
    newSnapshot: WorkflowSnapshot
): string {
    const changes = compareSnapshots(oldSnapshot, newSnapshot)
    const parts: string[] = []

    if (changes.nodesAdded > 0) parts.push(`+${changes.nodesAdded} node(s)`)
    if (changes.nodesRemoved > 0) parts.push(`-${changes.nodesRemoved} node(s)`)
    if (changes.nodesModified > 0) parts.push(`~${changes.nodesModified} node(s)`)
    if (changes.edgesAdded > 0) parts.push(`+${changes.edgesAdded} edge(s)`)
    if (changes.edgesRemoved > 0) parts.push(`-${changes.edgesRemoved} edge(s)`)

    return parts.length > 0 ? parts.join(', ') : 'No changes'
}