<script setup lang="ts">
  import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
  import { Background } from '@vue-flow/background'
  import { Controls } from '@vue-flow/controls'
  import { MiniMap } from '@vue-flow/minimap'
  import { useWorkflowStore } from '@/stores/workflowStore'
  import type { NodeTypeDefinition } from '@/types/workflow'
  import CustomNode from './nodes/CustomNode.vue'
  
  const store = useWorkflowStore()
  
  const { onConnect, onNodeClick, onPaneClick, project } = useVueFlow()
  
  // Handle connections
  onConnect((connection) => {
    store.addEdge({
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      animated: true,
      markerEnd: MarkerType.ArrowClosed
    })
  })
  
  // Handle node click
  onNodeClick((event) => {
    const node = store.nodes.find(n => n.id === event.node.id)
    if (node) {
      store.selectNode(node)
    }
  })
  
  // Handle pane click (deselect)
  onPaneClick(() => {
    store.selectNode(null)
  })
  
  // Handle drop
  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    
    if (!event.dataTransfer) return
    
    const nodeDataStr = event.dataTransfer.getData('application/vueflow')
    if (!nodeDataStr) return
    
    try {
      const nodeType: NodeTypeDefinition = JSON.parse(nodeDataStr)
      
      // Get the position relative to the Vue Flow pane
      const { x, y } = project({ x: event.clientX, y: event.clientY })
  
      store.addNode({
        position: { x, y },
        data: {
          label: nodeType.label,
          nodeType: nodeType.category,
          icon: nodeType.icon,
          config: { ...nodeType.config }
        }
      })
    } catch (error) {
      console.error('Failed to parse node data:', error)
    }
  }
  
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }
  
  // Minimap node color
  const getMinimapNodeColor = (node: any) => {
    const colors = {
      trigger: '#ff6b35',
      action: '#00d4ff',
      logic: '#ffd60a'
    }
    return colors[node.data?.nodeType as keyof typeof colors] || '#94a3b8'
  }
  </script>
  
  <template>
    <div class="flex-1 relative bg-gray-50">
      <VueFlow
        v-model:nodes="store.nodes"
        v-model:edges="store.edges"
        class="bg-gray-50"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
        :snap-to-grid="true"
        :snap-grid="[15, 15]"
        @drop="handleDrop"
        @dragover="handleDragOver"
      >
        <!-- Background with grid pattern -->
        <Background
          pattern-color="rgba(0, 0, 0, 0.1)"
          :gap="20"
        />
  
        <!-- Controls (zoom, fit view, etc) -->
        <Controls
          :show-zoom="true"
          :show-fit-view="true"
          :show-interactive="true"
        />
  
        <!-- Minimap -->
        <MiniMap
          :node-color="getMinimapNodeColor"
          mask-color="rgba(255, 255, 255, 0.8)"
          class="!bg-white !border !border-gray-300 !rounded-lg"
        />
  
        <!-- Custom Node Template -->
        <template #node-custom="props">
          <CustomNode v-bind="props" />
        </template>
      </VueFlow>
  
      <!-- Top Toolbar -->
      <div class="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
        <div class="bg-white border border-gray-300 rounded-lg px-4 py-2 pointer-events-auto shadow-sm">
          <div class="font-mono text-sm text-gray-600 flex items-center gap-4">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></span>
              {{ store.nodeCount }} nodes
            </span>
            <span class="text-gray-400">•</span>
            <span>{{ store.edgeCount }} connections</span>
          </div>
        </div>
  
        <div class="bg-white border border-gray-300 rounded-lg px-3 py-2 pointer-events-auto shadow-sm">
          <div class="flex items-center gap-2">
            <button
              @click="store.undo()"
              :disabled="!store.canUndo"
              :class="[
                'px-3 py-1.5 rounded text-sm font-medium transition-all',
                store.canUndo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              ]"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              @click="store.redo()"
              :disabled="!store.canRedo"
              :class="[
                'px-3 py-1.5 rounded text-sm font-medium transition-all',
                store.canRedo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              ]"
              title="Redo (Ctrl+Shift+Z)"
            >
              ↷
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';
  @import '@vue-flow/controls/dist/style.css';
  @import '@vue-flow/minimap/dist/style.css';
  
  .vue-flow__edge-path {
    stroke: #0891b2;
    stroke-width: 2;
    transition: stroke-width 0.2s;
  }
  
  .vue-flow__edge.selected .vue-flow__edge-path {
    stroke-width: 3;
    stroke: #0891b2 !important;
  }
  
  .vue-flow__handle {
    width: 12px;
    height: 12px;
    border: 2px solid #ffffff;
    transition: all 0.2s;
  }
  </style>