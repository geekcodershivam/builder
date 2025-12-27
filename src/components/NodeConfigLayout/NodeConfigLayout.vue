<script setup lang="ts">
    import { computed } from 'vue'
    import { useWorkflowStore } from '@/stores/workflowStore'
    import { getNodeConfig } from './registry'
    import { useNodeForm } from './useNodeForm'
    
    const store = useWorkflowStore()
    const selectedNode = computed(() => store.selectedNode)
    
    // Get the appropriate config component and schema
    const configEntry = computed(() => {
      if (!selectedNode.value) return null
      return getNodeConfig(selectedNode.value.data.label)
    })
    
    // Setup form with validation if schema exists
    computed(() => {
      if (!configEntry.value?.hasValidation) return null
      return useNodeForm(configEntry.value.schema)
    })

    </script>
    
    <template>
      <div v-if="selectedNode && configEntry" class="flex-1 overflow-y-auto p-6">
        <component :is="configEntry.component"  />
      </div>
      <div v-else class="flex-1 overflow-y-auto p-6">
        <div class="text-center py-8 text-gray-500">
          <p class="text-sm">No configuration available for this node type.</p>
        </div>
      </div>
    </template>