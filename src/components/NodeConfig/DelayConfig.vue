<script setup lang="ts">
    import { useField } from 'vee-validate'
    import { computed } from 'vue'
    import { convertToSeconds, formatDelay } from '@/schemas/delay.schema'
    
    // Form fields
    const { value: duration, errorMessage: durationError } = useField<number>('duration')
    const { value: unit, errorMessage: unitError } = useField<string>('unit')
    
    // Time unit options
    const timeUnits = [
      { value: 'seconds', label: 'Seconds', icon: '⏱️' },
      { value: 'minutes', label: 'Minutes', icon: '⏲️' },
      { value: 'hours', label: 'Hours', icon: '🕐' },
      { value: 'days', label: 'Days', icon: '📅' }
    ]
    
    // Calculate total seconds for preview
    const totalSeconds = computed(() => {
      if (duration.value && unit.value) {
        return convertToSeconds(duration.value, unit.value)
      }
      return 0
    })
    
    // Format the delay for preview
    const delayPreview = computed(() => {
      if (duration.value && unit.value) {
        return formatDelay(duration.value, unit.value)
      }
      return 'Not set'
    })
    
    // Show warning for very long delays
    const showWarning = computed(() => {
      return totalSeconds.value > 3600 // More than 1 hour
    })
    
    // Convert seconds to human-readable format
    const formatSeconds = (seconds: number): string => {
      if (seconds < 60) return `${seconds} seconds`
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`
      return `${Math.floor(seconds / 86400)} days`
    }
    </script>
    
    <template>
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
          <span class="text-2xl">⏰</span>
          <div>
            <h3 class="text-sm font-semibold text-gray-700">Delay Configuration</h3>
            <p class="text-xs text-gray-500">Pause workflow execution for a specified time</p>
          </div>
        </div>
    
        <!-- Duration Input -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Duration <span class="text-red-400">*</span>
          </label>
          <input
            v-model.number="duration"
            type="number"
            min="1"
            max="86400"
            step="1"
            :class="[
              'w-full bg-white border rounded-lg px-3 py-2 text-sm transition-colors',
              durationError 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            ]"
            placeholder="Enter duration"
          />
          <p v-if="durationError" class="mt-1 text-xs text-red-400">
            {{ durationError }}
          </p>
          <p v-else class="mt-1 text-xs text-gray-500">
            Enter a positive number (1-86400)
          </p>
        </div>
    
        <!-- Time Unit Selection -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Time Unit <span class="text-red-400">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="timeUnit in timeUnits"
              :key="timeUnit.value"
              type="button"
              @click="unit = timeUnit.value"
              :class="[
                'flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                unit === timeUnit.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              ]"
            >
              <span>{{ timeUnit.icon }}</span>
              <span>{{ timeUnit.label }}</span>
            </button>
          </div>
          <p v-if="unitError" class="mt-1 text-xs text-red-400">
            {{ unitError }}
          </p>
        </div>
    
        <!-- Preview Section -->
        <div 
          v-if="duration && unit"
          class="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">⏱️</span>
            <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Preview</span>
          </div>
          <div class="space-y-1">
            <div class="flex items-baseline gap-2">
              <span class="text-sm text-gray-600">Delay:</span>
              <span class="text-lg font-bold text-blue-700">{{ delayPreview }}</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-sm text-gray-600">Total:</span>
              <span class="text-sm font-semibold text-gray-700">{{ formatSeconds(totalSeconds) }}</span>
              <span class="text-xs text-gray-500">({{ totalSeconds.toLocaleString() }} seconds)</span>
            </div>
          </div>
        </div>
    
        <!-- Warning for Long Delays -->
        <div 
          v-if="showWarning"
          class="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
        >
          <span class="text-lg">⚠️</span>
          <div class="flex-1">
            <p class="text-xs font-semibold text-yellow-800 mb-1">Long Delay Warning</p>
            <p class="text-xs text-yellow-700">
              This delay is longer than 1 hour. Make sure this is intentional for your workflow.
            </p>
          </div>
        </div>
    
        <!-- Quick Presets -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Quick Presets
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="duration = 30; unit = 'seconds'"
              class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              30 sec
            </button>
            <button
              type="button"
              @click="duration = 1; unit = 'minutes'"
              class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              1 min
            </button>
            <button
              type="button"
              @click="duration = 5; unit = 'minutes'"
              class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              5 min
            </button>
            <button
              type="button"
              @click="duration = 15; unit = 'minutes'"
              class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              15 min
            </button>
            <button
              type="button"
              @click="duration = 1; unit = 'hours'"
              class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              1 hour
            </button>
            <button
              type="button"
              @click="duration = 1; unit = 'days'"
              class="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              1 day
            </button>
          </div>
        </div>
    
        <!-- Info Section -->
        <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div class="flex items-start gap-2">
            <span class="text-sm">ℹ️</span>
            <div class="flex-1">
              <p class="text-xs font-semibold text-gray-700 mb-1">How It Works</p>
              <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Workflow pauses at this node for the specified duration</li>
                <li>No other nodes execute during the delay</li>
                <li>Useful for rate limiting, waiting for external processes, or scheduling</li>
                <li>Maximum delay: 24 hours (86400 seconds)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <style scoped>
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 1;
    }
    
    input[type="number"] {
      -moz-appearance: textfield;
    }
    </style>