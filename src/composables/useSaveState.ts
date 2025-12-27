import { ref, computed } from 'vue'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useSaveState(autoResetMs = 2000) {
  const status = ref<SaveStatus>('idle')
  let resetTimeout: NodeJS.Timeout | null = null

  const isSaving = computed(() => status.value === 'saving')
  const saveMessage = computed(() => {
    switch (status.value) {
      case 'saved': return '✓ Saved'
      case 'error': return '✗ Error'
      default: return ''
    }
  })

  const clearResetTimeout = () => {
    if (resetTimeout) {
      clearTimeout(resetTimeout)
      resetTimeout = null
    }
  }

  const scheduleReset = () => {
    clearResetTimeout()
    resetTimeout = setTimeout(() => {
      if (status.value === 'saved' || status.value === 'error') {
        status.value = 'idle'
      }
    }, autoResetMs)
  }

  const setSaving = () => {
    clearResetTimeout()
    status.value = 'saving'
  }

  const setSaved = () => {
    status.value = 'saved'
    scheduleReset()
  }

  const setError = () => {
    status.value = 'error'
    scheduleReset()
  }

  const resetMessage = () => {
    clearResetTimeout()
    status.value = 'idle'
  }

  return {
    status: computed(() => status.value),
    isSaving,
    saveMessage,
    setSaving,
    setSaved,
    setError,
    resetMessage
  }
}