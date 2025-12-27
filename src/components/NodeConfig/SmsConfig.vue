<script setup lang="ts">
import { useField } from 'vee-validate'
import { watch } from 'vue'

const { value: to, errorMessage: toError } = useField<string>('to')
const { value: message, errorMessage: messageError } = useField<string>('message')
watch(to, (newVal) => {
    console.log('📱 [SmsConfig] "to" field changed:', newVal)
})

watch(message, (newVal) => {
    console.log('📱 [SmsConfig] "message" field changed:', newVal?.substring(0, 50) + '...')
})
</script>

<template>
    <div class="space-y-4">
        <!-- To (Phone Number) -->
        <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                To (Phone Number) <span class="text-red-400">*</span>
            </label>
            <input v-model="to" type="tel" :class="[
                'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-all',
                toError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]" placeholder="+1234567890" />
            <p v-if="toError" class="mt-1 text-xs text-red-400">{{ toError }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Format: +1234567890 or 1234567890 (min 10 digits)</p>
        </div>

        <!-- Message -->
        <div>
            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Message <span class="text-red-400">*</span>
            </label>
            <textarea v-model="message" :class="[
                'w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none transition-all resize-none',
                messageError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20'
            ]" rows="6" placeholder="Your SMS message..."></textarea>
            <p v-if="messageError" class="mt-1 text-xs text-red-400">{{ messageError }}</p>
        </div>
    </div>
</template>