<script setup lang="ts">
    import { ref } from 'vue'
    
    interface Props {
      disabled?: boolean
      variant?: 'default' | 'primary' | 'danger'
      tooltip?: string
      icon?: string
    }
    
    const props = withDefaults(defineProps<Props>(), {
      disabled: false,
      variant: 'default'
    })
    
    const emit = defineEmits<{
      click: []
    }>()
    
    const isHovered = ref(false)
    
    const variantClasses = {
      default: {
        base: 'bg-gray-50 text-gray-700 border-accent-yellow/30',
        hover: 'hover:bg-gray-100 hover:shadow-md',
        disabled: 'text-gray-400 cursor-not-allowed opacity-50'
      },
      primary: {
        base: 'bg-gradient-to-r from-cyan-600 to-green-600 text-white',
        hover: 'hover:from-cyan-700 hover:to-green-700 hover:shadow-lg',
        disabled: 'opacity-50 cursor-not-allowed'
      },
      danger: {
        base: 'bg-red-50 text-red-600',
        hover: 'hover:bg-red-100 hover:shadow-md',
        disabled: 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
      }
    }
    
    const getButtonClasses = () => {
      const variant = variantClasses[props.variant]
      const baseClasses = 'w-full h-12 flex items-center justify-center rounded-lg transition-all relative border'
      
      if (props.disabled) {
        return `${baseClasses} ${variant.base} ${variant.disabled}`
      }
      
      return `${baseClasses} ${variant.base} ${variant.hover}`
    }
    </script>
    
    <template>
      <button
        @click="emit('click')"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        :disabled="disabled"
        :class="getButtonClasses()"
        :title="tooltip"
      >
        <slot name="icon">
          <svg v-if="icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
          </svg>
        </slot>
        <slot />
      </button>
    </template>