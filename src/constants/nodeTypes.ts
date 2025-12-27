import type { NodeTypeDefinition } from '@/types/workflow'

export const NODE_TYPES: Record<string, NodeTypeDefinition[]> = {
  triggers: [
    {
      type: 'manual',
      label: 'Manual',
      icon: '⚡',
      color: '#ff6b35',
      category: 'trigger',
      config: {},
      description: 'Manually trigger the workflow'
    },
    {
      type: 'webhook',
      label: 'Webhook',
      icon: '🔗',
      color: '#ff6b35',
      category: 'trigger',
      config: {
        url: '',
        method: 'POST'
      },
      description: 'Trigger workflow via HTTP webhook'
    }
  ],
  actions: [
    {
      type: 'http',
      label: 'HTTP',
      icon: '🌐',
      color: '#00d4ff',
      category: 'action',
      config: {
        url: '',
        method: 'GET',
        headers: '{}',
        body: ''
      },
      description: 'HTTP Request'
    },
    {
      type: 'email',
      label: 'Email',
      icon: '✉️',
      color: '#00d4ff',
      category: 'action',
      config: {
        to: '',
        subject: '',
        body: ''
      },
      description: 'Send the Email'
    },
    {
      type: 'sms',
      label: 'SMS',
      icon: '💬',
      color: '#00d4ff',
      category: 'action',
      config: {
        to: '',
        message: ''
      },
      description: 'Send the SMS'
    },
    {
      type: 'end',
      label: 'End',
      icon: '🏁',
      color: '#06ffa5',
      category: 'action',
      config: {},
      description: 'Terminate End'
    },
  ],
  logic: [
    {
      type: 'condition',
      label: 'Condition',
      icon: '🔀',
      color: '#ffd60a',
      category: 'logic',
      config: {
        expression: '',
        trueLabel: 'True',
        falseLabel: 'False'
      },
      description: 'Conditional branching logic'
    },
    {
      type: 'transform',
      label: 'Transform',
      icon: '⚙️',
      color: '#ffd60a',
      category: 'logic',
      config: {
        script: ''
      },
      description: 'Transform data with JavaScript'
    },
    {
      type: 'delay',
      label: 'Delay',
      icon: '⏰',
      color: '#ffd60a',
      category: 'logic',
      config: {
        duration: 1,
        unit: 'seconds'
      },
      description: 'Wait for a specified amount of time'
    }
  ]
}

export const COLORS = {
  trigger: '#ff6b35',
  action: '#00d4ff',
  logic: '#ffd60a',
  success: '#06ffa5',
  error: '#ef4444',
  warning: '#fbbf24',
  info: '#3b82f6'
}

export const STORAGE_KEYS = {
  WORKFLOW: 'workflow_data',
  PREFERENCES: 'workflow_preferences'
}

export const EXECUTION_DELAY = 1000 // ms between node executions
export const HISTORY_LIMIT = 50 // max undo/redo steps
export const AUTOSAVE_DELAY = 1000 // ms debounce for autosave