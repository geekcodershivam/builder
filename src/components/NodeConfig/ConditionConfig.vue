<script setup lang="ts">
    import { useField } from 'vee-validate'
    
    const { value: expression, errorMessage: expressionError } = useField<string>('expression')
    const { value: trueLabel } = useField<string>('trueLabel')
    const { value: falseLabel } = useField<string>('falseLabel')
    </script>
    
    <template>
      <div class="space-y-4">
        <!-- Expression -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Expression <span class="text-red-400">*</span>
          </label>
          <input
            v-model="expression"
            type="text"
            :class="[
              'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 font-mono focus:outline-none transition-all',
              expressionError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]"
            placeholder="value > 100"
          />
          <p v-if="expressionError" class="mt-1 text-xs text-red-400">{{ expressionError }}</p>
          <p v-else class="mt-1 text-xs text-gray-500">JavaScript expression to evaluate</p>
        </div>
    
        <!-- True/False Labels -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              True Label
            </label>
            <input
              v-model="trueLabel"
              type="text"
              class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
              placeholder="True"
            />
          </div>
    
          <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              False Label
            </label>
            <input
              v-model="falseLabel"
              type="text"
              class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
              placeholder="False"
            />
          </div>
        </div>
      </div>
    </template>