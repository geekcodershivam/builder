<script setup lang="ts">
import { ref } from 'vue'
import { NODE_TYPES } from '@/constants/nodeTypes'
import type { NodeTypeDefinition } from '@/types/workflow'

const hoveredNode = ref<NodeTypeDefinition | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const onDragStart = (event: DragEvent, nodeType: NodeTypeDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeType))
  }
  hoveredNode.value = null
}

const showTooltip = (event: MouseEvent, node: NodeTypeDefinition) => {
  hoveredNode.value = node
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.right + 10,
    y: rect.top
  }
}

const hideTooltip = () => {
  hoveredNode.value = null
}
</script>

<template>
  <div class="w-24 bg-secondary border-r border-gray-300 flex flex-col shadow-sm max-h-screen">
    <!-- Header -->
    <div class="p-3 border-b border-gray-300 flex-shrink-0">
      <div class="text-center">
        <div class="text-2xl font-bold bg-gradient-to-r from-accent-cyan to-accent-green bg-clip-text text-transparent">
          ❄
        </div>
      </div>
    </div>

    <!-- Node Categories -->
    <div class="flex-1 overflow-y-auto p-2">
      <!-- Triggers -->
      <div class="mb-4">
        <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 text-center">
          Triggers
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="node in NODE_TYPES.triggers"
            :key="node.type"
            class="palette-item aspect-square bg-white rounded-lg border border-accent-orange/30 hover:border-accent-orange hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center relative group"
            draggable="true"
            @dragstart="onDragStart($event, node)"
            @mouseenter="showTooltip($event, node)"
            @mouseleave="hideTooltip"
          >
            <span class="text-2xl group-hover:scale-110 transition-transform">{{ node.icon }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mb-4">
        <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 text-center">
          Actions
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="node in NODE_TYPES.actions"
            :key="node.type"
            class="palette-item aspect-square bg-white rounded-lg border border-accent-cyan/30 hover:border-accent-cyan hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center relative group"
            draggable="true"
            @dragstart="onDragStart($event, node)"
            @mouseenter="showTooltip($event, node)"
            @mouseleave="hideTooltip"
          >
            <span class="text-2xl group-hover:scale-110 transition-transform">{{ node.icon }}</span>
          </div>
        </div>
      </div>

      <!-- Logic -->
      <div class="mb-4">
        <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 text-center">
          Logic
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="node in NODE_TYPES.logic"
            :key="node.type"
            class="palette-item aspect-square bg-white rounded-lg border border-accent-yellow/30 hover:border-accent-yellow hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center relative group"
            draggable="true"
            @dragstart="onDragStart($event, node)"
            @mouseenter="showTooltip($event, node)"
            @mouseleave="hideTooltip"
          >
            <span class="text-2xl group-hover:scale-110 transition-transform">{{ node.icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="hoveredNode"
        class="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm max-w-xs pointer-events-none"
        :style="{
          left: tooltipPosition.x + 'px',
          top: tooltipPosition.y + 'px'
        }"
      >
        <div class="font-semibold mb-1">{{ hoveredNode.label }}</div>
        <div class="text-xs text-gray-300">{{ hoveredNode.description }}</div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Removed slide-in animation for compact layout */
</style>