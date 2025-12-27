<script setup lang="ts">
  import { computed } from 'vue'
  import { useWorkflowStore } from '@/stores/workflowStore'
  
  const props = defineProps<{
    isVisible: boolean
  }>()
  
  const emit = defineEmits<{
    close: []
  }>()
  
  const store = useWorkflowStore()
  
  const isRunning = computed(() => store.executionState.isRunning)
  const logs = computed(() => store.executionState.logs)
  
  const getLogIcon = (type: string) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }
    return icons[type as keyof typeof icons] || 'ℹ️'
  }
  
  const getLogClass = (type: string) => {
    const classes = {
      info: 'border-accent-cyan bg-accent-cyan/5',
      success: 'border-accent-green bg-accent-green/5',
      error: 'border-red-500 bg-red-500/5',
      warning: 'border-yellow-500 bg-yellow-500/5'
    }
    return classes[type as keyof typeof classes] || 'border-gray-600'
  }
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }
  </script>
  
  <template>
    <Transition name="slide-up">
      <div
        v-if="isVisible"
        class="absolute bottom-0 left-0 right-0 h-80 max-h-[50vh] bg-white border-t border-gray-300 flex flex-col shadow-2xl z-20"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-300 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
            <h3 class="font-bold text-gray-800">Execution Preview</h3>
            <span v-if="isRunning" class="text-xs px-2 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full font-mono">
              Running...
            </span>
          </div>
  
          <div class="flex items-center gap-2">
            <button
              v-if="!isRunning"
              @click="store.startExecution()"
              class="px-4 py-2 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:from-cyan-700 hover:to-green-700 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Run Workflow
            </button>
            <button
              v-else
              @click="store.stopExecution()"
              class="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
              </svg>
              Stop
            </button>
  
            <button
              @click="store.clearLogs()"
              :disabled="logs.length === 0"
              class="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Clear logs"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
  
            <button
              @click="emit('close')"
              class="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-lg ml-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
  
        <!-- Logs -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div v-if="logs.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4 opacity-20">▶️</div>
            <p class="text-gray-500 text-sm">
              Click "Run Workflow" to start execution preview
            </p>
            <p class="text-gray-600 text-xs mt-2">
              Logs will appear here during execution
            </p>
          </div>
  
          <div v-else class="space-y-2 font-mono text-sm">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="[
                'p-3 rounded-lg border-l-4 animate-fade-in',
                getLogClass(log.type)
              ]"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div class="flex justify-between items-start gap-3">
                <div class="flex items-start gap-2 flex-1">
                  <span class="mt-0.5">{{ getLogIcon(log.type) }}</span>
                  <span class="text-gray-700 flex-1">{{ log.message }}</span>
                </div>
                <span class="text-xs text-gray-500 whitespace-nowrap">
                  {{ formatTime(log.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Footer Stats -->
        <div class="px-4 py-2 border-t border-gray-300 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center gap-4">
            <span>{{ logs.length }} log entries</span>
            <span v-if="logs.filter(l => l.type === 'success').length > 0">
              ✓ {{ logs.filter(l => l.type === 'success').length }} successful
            </span>
            <span v-if="logs.filter(l => l.type === 'error').length > 0" class="text-red-400">
              ✗ {{ logs.filter(l => l.type === 'error').length }} errors
            </span>
          </div>
          <div class="font-mono">
            Execution delay: 1s per node
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <style scoped>
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  .slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
  }
  
  .slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  </style>