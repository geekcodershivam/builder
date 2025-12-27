<script setup lang="ts">
    interface Props {
      name: string
      size?: string
      filled?: boolean
    }
    
    const props = withDefaults(defineProps<Props>(), {
      size: 'w-5 h-5',
      filled: false
    })
    
    const icons: Record<string, string> = {
      undo: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
      redo: 'M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6',
      save: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
      export: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
      import: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
      trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    }
    
    const filledIcons: Record<string, string> = {
      play: 'M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z'
    }
    </script>
    
    <template>
      <svg 
        :class="size" 
        :fill="filled ? 'currentColor' : 'none'" 
        :stroke="filled ? 'none' : 'currentColor'" 
        viewBox="0 0 24 24"
      >
        <path 
          v-if="filled && filledIcons[name]"
          :d="filledIcons[name]"
        />
        <path 
          v-else-if="icons[name]"
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          :d="icons[name]" 
        />
      </svg>
    </template>