<script setup lang="ts">
  import { Handle, Position } from '@vue-flow/core'
  import type { WorkflowNodeData } from '@/types/workflow'
  import { computed } from 'vue'
  import { useWorkflowStore } from '@/stores/workflowStore'
  
  interface Props {
    id: string
    data: WorkflowNodeData
  }
  
  const props = defineProps<Props>()
  const store = useWorkflowStore()
  
  const nodeClass = computed(() => {
    const baseClass = 'border-2 rounded-xl p-4 bg-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer min-w-[200px]'
    
    // Special styling for End node
    if (props.data.label === 'End') {
      return `${baseClass} border-accent-green ring-2 ring-accent-green/20`
    }
    
    const typeClass = {
      trigger: 'border-accent-orange',
      action: 'border-accent-cyan',
      logic: 'border-accent-yellow'
    }[props.data.nodeType]
    
    return `${baseClass} ${typeClass}`
  })
  
  const executionStatus = computed(() => {
    return store.executionState.nodeStatuses[props.id]
  })
  
  const statusClass = computed(() => {
    if (!executionStatus.value) return ''
    
    const classes = {
      running: 'ring-2 ring-accent-cyan ring-offset-2 ring-offset-primary animate-pulse',
      success: 'ring-2 ring-accent-green ring-offset-2 ring-offset-primary',
      error: 'ring-2 ring-red-500 ring-offset-2 ring-offset-primary',
      pending: 'opacity-50',
      skipped: 'opacity-30'
    }
    
    return classes[executionStatus.value] || ''
  })
  </script>
  
  <template>
    <div :class="[nodeClass, statusClass]">
      <!-- Input Handle (not for trigger nodes) -->
      <Handle
        v-if="data.nodeType !== 'trigger'"
        type="target"
        :position="Position.Top"
        class="!w-1 !h-1 !bg-accent-cyan !border-2 !border-white hover:!w-4 hover:!h-4 transition-all"
      />
  
      <!-- Node Content -->
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">{{ data.icon }}</span>
        <div class="flex-1">
          <div class="font-semibold text-sm text-gray-800">{{ data.label }}</div>
          <div class="text-xs text-gray-500 font-mono">{{ id.split('_')[1] }}</div>
        </div>
      </div>
  
      <!-- Required Badge for End -->
      <div v-if="data.label === 'End'" class="mb-2">
        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-accent-green/10 text-accent-green border border-accent-green/30">
          ✓ Required
        </span>
      </div>
  
      <!-- Execution Status Badge -->
      <div v-if="executionStatus" class="mt-2">
        <span
          :class="[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            {
              'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30': executionStatus === 'running',
              'bg-accent-green/10 text-accent-green border border-accent-green/30': executionStatus === 'success',
              'bg-red-500/10 text-red-500 border border-red-500/30': executionStatus === 'error',
              'bg-gray-500/10 text-gray-500 border border-gray-500/30': executionStatus === 'pending',
              'bg-gray-600/10 text-gray-600 border border-gray-600/30': executionStatus === 'skipped'
            }
          ]"
        >
          <span v-if="executionStatus === 'running'" class="animate-spin">⟳</span>
          <span v-else-if="executionStatus === 'success'">✓</span>
          <span v-else-if="executionStatus === 'error'">✗</span>
          {{ executionStatus }}
        </span>
      </div>
  
      <!-- Output Handle (not for End node) -->
      <Handle
        v-if="data.label !== 'End'"
        type="source"
        :position="Position.Bottom"
        class="!w-3 !h-3 !bg-accent-cyan !border-2 !border-white hover:!w-4 hover:!h-4 transition-all"
      />
    </div>
  </template>