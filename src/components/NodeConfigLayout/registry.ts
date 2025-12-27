import type { Component } from 'vue'
import type { ZodSchema } from 'zod'
import DelayConfig from '@/components/NodeConfig/Delayconfig.vue'
import EmailConfig from '@/components/NodeConfig/EmailConfig.vue'
import SmsConfig from '@/components/NodeConfig/SmsConfig.vue'
import HttpConfig from '@/components/NodeConfig/HttpConfig.vue'
import WebhookConfig from '@/components/NodeConfig/WebhookConfig.vue'
import ConditionConfig from '@/components/NodeConfig/ConditionConfig.vue'
import TransformConfig from '@/components/NodeConfig/TransformConfig.vue'
import ManualConfig from '@/components/NodeConfig/ManualConfig.vue'
import EndConfig from '@/components/NodeConfig/EndConfig.vue'

import { emailSchema } from '@/schemas/email.schema'
import { smsSchema } from '@/schemas/sms.schema'
import { httpSchema } from '@/schemas/http.schema'
import { webhookSchema } from '@/schemas/webhook.schema'
import { conditionSchema } from '@/schemas/condition.schema'
import { transformSchema } from '@/schemas/transform.schema'
import { delaySchema } from '@/schemas/delay.schema'

export interface NodeConfigRegistryEntry {
  component: Component
  schema?: ZodSchema
  hasValidation: boolean
}

export const nodeConfigRegistry: Record<string, NodeConfigRegistryEntry> = {
  'Email': {
    component: EmailConfig,
    schema: emailSchema,
    hasValidation: true
  },
  'SMS': {
    component: SmsConfig,
    schema: smsSchema,
    hasValidation: true
  },
  'HTTP': {
    component: HttpConfig,
    schema: httpSchema,
    hasValidation: true
  },
  'Webhook': {
    component: WebhookConfig,
    schema: webhookSchema,
    hasValidation: true
  },
  'Condition': {
    component: ConditionConfig,
    schema: conditionSchema,
    hasValidation: true
  },
  'Transform': {
    component: TransformConfig,
    schema: transformSchema,
    hasValidation: true
  },
  'Delay': {
    component: DelayConfig,
    schema: delaySchema,
    hasValidation: true
  },
  'Manual': {
    component: ManualConfig,
    hasValidation: false
  },
  'End': {
    component: EndConfig,
    hasValidation: false
  }
}

export function getNodeConfig(nodeLabel: string): NodeConfigRegistryEntry | null {
  return nodeConfigRegistry[nodeLabel] || null
}