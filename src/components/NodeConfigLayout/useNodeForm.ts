import { computed, watch, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { ZodSchema } from 'zod'
import { useWorkflowStore } from '@/stores/workflowStore'

export function useNodeForm(schema?: ZodSchema) {
  const store = useWorkflowStore()
  const selectedNode = computed(() => store.selectedNode)
  const lastSavedValues = ref<Record<string, any>>({})
  const isSaving = ref(false)
  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Setup form with schema validation if provided
  const { values, errors, meta, setValues, resetForm, validate } = useForm({
    validationSchema: schema ? toTypedSchema(schema) : undefined,
    initialValues: selectedNode.value?.data.config || {}
  })

  // Track if form has unsaved changes
  const isDirty = computed(() => {
    if (!values || !lastSavedValues.value) return false
    return JSON.stringify(values) !== JSON.stringify(lastSavedValues.value)
  })

  // Manual save function for Save button
  const saveConfig = async () => {
    console.log("trigger")
    if (!selectedNode.value) return { success: false, message: 'No node selected' }

    isSaving.value = true
    saveStatus.value = 'saving'

    try {
      // Validate if schema exists
      if (schema) {
        const result = await validate()
        if (!result.valid) {
          saveStatus.value = 'error'
          isSaving.value = false
          return { 
            success: false, 
            message: 'Validation failed', 
            errors: Object.values(result.errors || {}) 
          }
        }
      }

      // Update store
      store.updateNode(selectedNode.value.id, {
        ...selectedNode.value.data,
        config: { ...values }
      })

      // Explicitly save to localStorage
      store.saveWorkflow()

      // Update tracking
      lastSavedValues.value = JSON.parse(JSON.stringify(values))
      saveStatus.value = 'saved'
      isSaving.value = false

      // Reset saved status after 2 seconds
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle'
        }
      }, 2000)

      return { success: true, message: 'Configuration saved successfully' }
    } catch (error) {
      saveStatus.value = 'error'
      isSaving.value = false
      return { success: false, message: 'Failed to save configuration' }
    }
  }

  // Auto-save on value change (debounced to avoid excessive saves)
  let autoSaveTimeout: NodeJS.Timeout | null = null
  watch(
    values,
    (newValues) => {
      if (selectedNode.value && newValues) {
        // Clear existing timeout
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout)
        }

        // Debounce auto-save by 1 second
        autoSaveTimeout = setTimeout(() => {
          store.updateNode(selectedNode.value!.id, {
            ...selectedNode.value!.data,
            config: { ...newValues }
          })
          lastSavedValues.value = JSON.parse(JSON.stringify(newValues))
        }, 1000)
      }
    },
    { deep: true }
  )

  // Reset form when node changes
  watch(
    selectedNode,
    (newNode) => {
      if (newNode) {
        const config = newNode.data.config || {}
        setValues(config)
        lastSavedValues.value = JSON.parse(JSON.stringify(config))
        saveStatus.value = 'idle'
      } else {
        resetForm()
        lastSavedValues.value = {}
        saveStatus.value = 'idle'
      }
    },
    { immediate: true }
  )

  return {
    values,
    errors,
    meta,
    isValid: computed(() => meta.value.valid),
    isDirty,
    isSaving: computed(() => isSaving.value),
    saveStatus: computed(() => saveStatus.value),
    saveConfig,
    validate,
    resetForm
  }
}