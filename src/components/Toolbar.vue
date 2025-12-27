<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useWorkflowStore } from '@/stores/workflowStore'
  import { useKeyboardShortcuts } from '@/components/ActionButton/useKeyboardShortcuts'
  import ActionButton from '@/components/ActionButton/ActionButton.vue'
  import Icon from '@/components/ActionButton/Icon.vue'
  import Tooltip from '@/components/ActionButton/Tooltip.vue'
  import type { ActionConfig } from '@/components/ActionButton/types'
  
  const emit = defineEmits<{
    toggleExecution: []
  }>()
  
  const store = useWorkflowStore()
  const hoveredAction = ref('')
  const hoveredNode = ref<ActionConfig | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

  const showTooltip = (event: MouseEvent, node: ActionConfig) => {
  hoveredNode.value = node;
  hoveredAction.value = node.id;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.right + 10,
    y: rect.top
  }
}
  
  const handleSave = () => {
    store.saveWorkflow()
  }
  
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the entire workflow? This cannot be undone.')) {
      store.clearWorkflow()
    }
  }
  
  const handleExport = () => {
    const data = store.exportWorkflow()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string
            store.importWorkflow(content)
          } catch (error) {
            alert('Failed to import workflow. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }
  
  // Define actions with computed properties for reactive disabled states
  const actions = computed<ActionConfig[]>(() => [
    {
      id: 'undo',
      icon: 'undo',
      tooltip: 'Undo (Ctrl+Z)',
      disabled: !store.canUndo,
      onClick: () => store.undo()
    },
    {
      id: 'redo',
      icon: 'redo',
      tooltip: 'Redo (Ctrl+Shift+Z)',
      disabled: !store.canRedo,
      onClick: () => store.redo()
    },
    {
      id: 'save',
      icon: 'save',
      tooltip: 'Save Workflow (Ctrl+S)',
      onClick: handleSave
    },
    {
      id: 'export',
      icon: 'export',
      tooltip: 'Export to JSON',
      disabled: store.nodeCount === 0,
      onClick: handleExport
    },
    {
      id: 'import',
      icon: 'import',
      tooltip: 'Import from JSON',
      onClick: handleImport
    },
    {
      id: 'run',
      icon: 'play',
      tooltip: 'Run Preview',
      variant: 'primary',
      filled: true,
      onClick: () => emit('toggleExecution')
    },
    {
      id: 'clear',
      icon: 'trash',
      tooltip: 'Clear Workflow',
      disabled: store.nodeCount === 0,
      variant: 'danger',
      onClick: handleClear
    }
  ])
  
  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrl: true,
      shift: false,
      handler: () => store.canUndo && store.undo()
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => store.canRedo && store.redo()
    },
    {
      key: 's',
      ctrl: true,
      handler: handleSave
    }
  ])
  </script>
  
  <template>
    <div class="w-24 border-t border-gray-300 bg-secondary border-r max-h-screen flex flex-col h-full">
      <div class="p-1 space-y-2">
        <ActionButton
          v-for="action in actions"
          :key="action.id"
          :disabled="action.disabled"
          :tooltip="action.tooltip"
          @click="action.onClick"
          @mouseenter="showTooltip($event, action)"
          @mouseleave="hoveredAction = ''"
        >
          <template #icon>
            <Icon :name="action.icon" :filled="action.filled" />
          </template>
        </ActionButton>
      </div>
  
      <Tooltip
        :text="actions.find(a => a.id === hoveredAction)?.tooltip || ''"
        :visible="!!hoveredAction"
        :tooltipPosition="tooltipPosition"
      />
    </div>
  </template>