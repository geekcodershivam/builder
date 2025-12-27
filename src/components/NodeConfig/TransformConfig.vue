<script setup lang="ts">
import { useField } from 'vee-validate'

const { value: script, errorMessage: scriptError } = useField<string>('script')
</script>

<template>
    <div class="space-y-4">
        <!-- JavaScript Code -->
        <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                JavaScript Code <span class="text-red-400">*</span>
            </label>
            <textarea v-model="script" :class="[
                'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 font-mono focus:outline-none transition-all resize-none',
                scriptError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]" rows="15" placeholder="// Transform the data
    return {
      ...input,
      transformed: true
    };"></textarea>
            <p v-if="scriptError" class="mt-1 text-xs text-red-400">{{ scriptError }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Access input data via 'input' variable</p>
        </div>
    </div>
</template>