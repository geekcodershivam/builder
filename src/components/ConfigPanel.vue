<script setup lang="ts">
  import { computed, watch } from 'vue'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { useWorkflowStore } from '@/stores/workflowStore'
  import { getNodeConfig } from '@/components/NodeConfigLayout/registry'
  import { useSaveState } from '@/composables/useSaveState'
  
  const store = useWorkflowStore()
  const { isSaving, saveMessage, setSaving, setSaved, setError, resetMessage } = useSaveState()
  
  const selectedNode = computed(() => store.selectedNode)
  const isVisible = computed(() => !!selectedNode.value)
  
  const configEntry = computed(() => 
    selectedNode.value ? getNodeConfig(selectedNode.value.data.label) : null
  )
  
  const validationSchema = computed(() => 
    configEntry.value?.schema ? toTypedSchema(configEntry.value.schema) : undefined
  )
  
  const { values, setValues, resetForm } = useForm({
    validationSchema: validationSchema.value,
    initialValues: selectedNode.value?.data.config || {}
  })
  
  // Auto-update store when form values change
  watch(values, (newValues) => {
    if (selectedNode.value && newValues) {
      store.updateNode(selectedNode.value.id, {
        ...selectedNode.value.data,
        config: { ...newValues }
      })
    }
  }, { deep: true })
  
  // Reset form when node selection changes
  watch(selectedNode, (newNode) => {
    if (newNode) {
      setValues(newNode.data.config || {})
    } else {
      resetForm()
    }
    resetMessage()
  }, { immediate: true })
  
  const closePanel = () => {
    store.selectNode(null)
    resetMessage()
  }
  
  const deleteNode = () => {
    if (selectedNode.value) {
      store.removeNode(selectedNode.value.id)
      closePanel()
    }
  }
  
  const handleSave = async () => {
    if (!selectedNode.value) return
    
    setSaving()
    try {
      store.saveWorkflow()
      setSaved()
    } catch (error) {
      setError()
    }
  }
  </script>
  
  <template>
    <Transition name="slide-right">
      <div
        v-if="isVisible && selectedNode"
        class="w-96 max-w-[calc(100vw-120px)] bg-white border-l border-gray-300 flex flex-col shadow-lg max-h-screen overflow-hidden"
      >
        <!-- Header -->
        <div class="p-6 border-b border-gray-300 flex-shrink-0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">Node Configuration</h2>
            <button
              @click="closePanel"
              class="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
              aria-label="Close panel"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span class="text-3xl">{{ selectedNode.data.icon }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-800 truncate">{{ selectedNode.data.label }}</div>
              <div class="text-xs text-gray-500 font-mono truncate">{{ selectedNode.id }}</div>
            </div>
          </div>
        </div>
  
        <!-- Configuration Form -->
        <div class="flex-1 overflow-y-auto p-6">
          <component 
            v-if="configEntry" 
            :is="configEntry.component"
            :key="selectedNode.id"
          />
          <div v-else class="text-center py-8 text-gray-500">
            <p class="text-sm">No configuration available for this node type.</p>
          </div>
        </div>
  
        <!-- Footer Actions -->
        <div class="p-6 border-t border-gray-300 space-y-2 flex-shrink-0 bg-white">
          <!-- Save Button -->
          <button
            @click="handleSave"
            :disabled="isSaving"
            :class="[
              'w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm',
              isSaving 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : saveMessage === '✓ Saved'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : saveMessage === '✗ Error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 hover:shadow-md'
            ]"
          >
            <svg v-if="!isSaving && !saveMessage" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <svg v-else-if="isSaving" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else-if="saveMessage === '✓ Saved'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="saveMessage === '✗ Error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            
            <span class="font-semibold">
              {{ saveMessage || (isSaving ? 'Saving...' : 'Save Configuration') }}
            </span>
          </button>
  
          <!-- Delete Button -->
          <button
            @click="deleteNode"
            class="w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Node
          </button>
  
          <!-- Help Text -->
          <div class="text-xs text-center text-gray-500 pt-2 space-y-1">
            <p>💡 Changes auto-sync to canvas</p>
            <p>💾 Click <strong>Save</strong> to persist to disk</p>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <style scoped>
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  .slide-right-enter-from {
    transform: translateX(20px);
    opacity: 0;
  }
  
  .slide-right-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
  </style>