import { onMounted, onUnmounted } from 'vue'
import { useWorkflowStore } from '@/stores/workflowStore'

export function useKeyboardShortcuts() {
  const store = useWorkflowStore()

  const handleKeydown = (event: KeyboardEvent) => {
    const isInputField = (event.target as HTMLElement)?.tagName === 'INPUT' || 
                         (event.target as HTMLElement)?.tagName === 'TEXTAREA' ||
                         (event.target as HTMLElement)?.isContentEditable

    // Undo: Ctrl/Cmd + Z
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      store.undo()
    }
    
    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    else if ((event.ctrlKey || event.metaKey) && (event.key === 'Z' || (event.key === 'z' && event.shiftKey) || event.key === 'y')) {
      event.preventDefault()
      store.redo()
    }
    
    // Delete/Backspace: Remove selected node
    else if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputField) {
      event.preventDefault()
      if (store.selectedNode) {
        store.removeNode(store.selectedNode.id)
        store.selectNode(null)
      }
    }
    
    // Ctrl/Cmd + S: Save workflow
    else if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      console.log("sss")
      event.preventDefault()
      store.saveWorkflow()
    }
    
    // Ctrl/Cmd + D: Duplicate selected node
    else if ((event.ctrlKey || event.metaKey) && event.key === 'd' && !isInputField) {
      event.preventDefault()
      if (store.selectedNode) {
        store.duplicateNode(store.selectedNode.id)
      }
    }
    
    // Escape: Deselect node
    else if (event.key === 'Escape') {
      store.selectNode(null)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    // Expose for manual usage if needed
    handleKeydown
  }
}
