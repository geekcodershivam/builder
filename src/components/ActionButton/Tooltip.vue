<script setup lang="ts">

interface Props {
    text: string
    visible: boolean
    position?: 'left' | 'right' | 'top' | 'bottom'
    offsetX?: string
    offsetY?: string
    tooltipPosition?: { x?: number, y?: number }
}

const props = withDefaults(defineProps<Props>(), {
    position: 'right',
    offsetX: '140px',
    offsetY: '50%',
})

</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-100"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="visible && text"
                class="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs pointer-events-none whitespace-nowrap"
                :style="tooltipPosition && {
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`
                }">
                {{ text }}
            </div>
        </Transition>
    </Teleport>
</template>