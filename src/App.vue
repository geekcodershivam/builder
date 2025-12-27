<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useWorkflowStore } from '@/stores/workflowStore'
  import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
  import NodePalette from '@/components/NodePalette.vue'
  import WorkflowCanvas from '@/components/WorkflowCanvas.vue'
  import ConfigPanel from '@/components/ConfigPanel.vue'
  import ExecutionPanel from '@/components/ExecutionPanel.vue'
  import Toolbar from '@/components/Toolbar.vue'
  
  const store = useWorkflowStore()
  const showExecutionPanel = ref(false)
  
  // Setup keyboard shortcuts
  useKeyboardShortcuts()
  
  // Load workflow on mount
  onMounted(() => {
    store.loadWorkflow()
  })
  
  const toggleExecutionPanel = () => {
    showExecutionPanel.value = !showExecutionPanel.value
  }
  </script>
  
  <template>
    <div class="flex max-h-screen w-screen bg-white text-gray-800 ">
      <!-- Left Sidebar - Node Palette + Toolbar -->
      <div class="flex flex-col  w-24 max-h-screen">
        <NodePalette />
        <Toolbar @toggle-execution="toggleExecutionPanel" />
      </div>
  
      <!-- Main Content Area -->
      <div class="flex-1 flex relative min-w-0 h-screen">
        <!-- Canvas -->
        <WorkflowCanvas class="flex-1 min-w-0" />
  
        <!-- Right Sidebar - Config Panel -->
        <ConfigPanel />
  
        <!-- Bottom Panel - Execution Preview -->
        <ExecutionPanel :is-visible="showExecutionPanel" @close="showExecutionPanel = false" />
      </div>
    </div>
  </template>
  
  <style>
  /* Global styles are in main.ts / index.css */
  </style>