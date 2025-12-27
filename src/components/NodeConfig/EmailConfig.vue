<script setup lang="ts">
    import { useField } from 'vee-validate'
    
    const { value: to, errorMessage: toError } = useField<string>('to')
    const { value: subject, errorMessage: subjectError } = useField<string>('subject')
    const { value: body, errorMessage: bodyError } = useField<string>('body')
    </script>
    
    <template>
      <div class="space-y-4">
        <!-- To -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            To <span class="text-red-400">*</span>
          </label>
          <input
            v-model="to"
            type="email"
            :class="[
              'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-all',
              toError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]"
            placeholder="user@example.com"
          />
          <p v-if="toError" class="mt-1 text-xs text-red-400">{{ toError }}</p>
        </div>
    
        <!-- Subject -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Subject <span class="text-red-400">*</span>
          </label>
          <input
            v-model="subject"
            type="text"
            :class="[
              'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-all',
              subjectError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]"
            placeholder="Email subject"
          />
          <p v-if="subjectError" class="mt-1 text-xs text-red-400">{{ subjectError }}</p>
        </div>
    
        <!-- Body -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Body <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="body"
            :class="[
              'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-all resize-none',
              bodyError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]"
            rows="10"
            placeholder="Email content..."
          ></textarea>
          <p v-if="bodyError" class="mt-1 text-xs text-red-400">{{ bodyError }}</p>
        </div>
      </div>
    </template>