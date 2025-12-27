<script setup lang="ts">
    import { useField } from 'vee-validate'
    
    const { value: url, errorMessage: urlError } = useField<string>('url')
    const { value: method } = useField<string>('method')
    </script>
    
    <template>
      <div class="space-y-4">
        <!-- Webhook URL -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Webhook URL <span class="text-red-400">*</span>
          </label>
          <input
            v-model="url"
            type="text"
            :class="[
              'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 font-mono focus:outline-none transition-all',
              urlError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]"
            placeholder="https://your-app.com/webhook"
          />
          <p v-if="urlError" class="mt-1 text-xs text-red-400">{{ urlError }}</p>
        </div>
    
        <!-- Method -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Method
          </label>
          <select
            v-model="method"
            class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
          </select>
        </div>
      </div>
    </template>