import type { WorkflowNode } from '@/types/workflow'

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validates phone number format
 * Accepts formats: +1234567890, 1234567890, +1-234-567-8900, etc.
 * @param phone - Phone number to validate
 * @returns True if valid phone format (min 10 digits)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]+$/
    const cleanPhone = phone.replace(/[\s\-()]/g, '')
    return phoneRegex.test(phone) && cleanPhone.length >= 10
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Validator function type
 */
type NodeValidator = (node: WorkflowNode) => string[]

/**
 * Validates Email node configuration
 */
export const validateEmailNode: NodeValidator = (node) => {
    const errors: string[] = []
    const config = node.data.config

    if (!config.to || !isValidEmail(config.to as string)) {
        errors.push(`❌ ${node.data.label} (${node.id}): Invalid or missing email address`)
    }
    if (!config.subject) {
        errors.push(`❌ ${node.data.label} (${node.id}): Subject is required`)
    }
    if (!config.body) {
        errors.push(`❌ ${node.data.label} (${node.id}): Email body is required`)
    }

    return errors
}

/**
 * Validates SMS node configuration
 */
export const validateSmsNode: NodeValidator = (node) => {
    const errors: string[] = []
    const config = node.data.config

    if (!config.to || !isValidPhone(config.to as string)) {
        errors.push(`❌ ${node.data.label} (${node.id}): Invalid or missing phone number`)
    }
    if (!config.message) {
        errors.push(`❌ ${node.data.label} (${node.id}): Message is required`)
    }

    return errors
}

/**
 * Validates HTTP Request node configuration
 */
export const validateHttpNode: NodeValidator = (node) => {
    const errors: string[] = []
    const config = node.data.config

    if (!config.url) {
        errors.push(`❌ ${node.data.label} (${node.id}): URL is required`)
    } else if (!isValidUrl(config.url as string)) {
        errors.push(`❌ ${node.data.label} (${node.id}): Invalid URL format`)
    }

    return errors
}

/**
 * Validates Webhook node configuration
 */
export const validateWebhookNode: NodeValidator = (node) => {
    const errors: string[] = []
    const config = node.data.config

    if (!config.url) {
        errors.push(`❌ ${node.data.label} (${node.id}): Webhook URL is required`)
    } else if (!isValidUrl(config.url as string)) {
        errors.push(`❌ ${node.data.label} (${node.id}): Invalid webhook URL format`)
    }

    return errors
}

/**
 * Validates Condition node configuration
 */
export const validateConditionNode: NodeValidator = (node) => {
    const errors: string[] = []
    const config = node.data.config

    if (!config.expression) {
        errors.push(`❌ ${node.data.label} (${node.id}): Expression is required`)
    }

    return errors
}

/**
 * Validates Transform node configuration
 */
export const validateTransformNode: NodeValidator = (node) => {
    const errors: string[] = []
    const config = node.data.config

    if (!config.script) {
        errors.push(`❌ ${node.data.label} (${node.id}): JavaScript code is required`)
    }

    return errors
}


/**

 * Validates Delay node configuration

 */

export const validateDelayNode: NodeValidator = (node) => {

    const errors: string[] = []
    const config = node.data.config

    if (!config.duration || config.duration <= 0) {

        errors.push(`❌ ${node.data.label} (${node.id}): Duration must be a positive number`)

    }

    if (config.duration > 86400) {

        errors.push(`❌ ${node.data.label} (${node.id}): Duration cannot exceed 24 hours (86400 seconds)`)

    }


    const validUnits = ['seconds', 'minutes', 'hours', 'days']

    if (!config.unit || !validUnits.includes(config.unit)) {

        errors.push(`❌ ${node.data.label} (${node.id}): Time unit must be one of: seconds, minutes, hours, days`)

    }


    return errors

}

/**
 * Registry mapping node labels to their validators
 * Makes it easy to add new node types
 */
export const nodeValidators: Record<string, NodeValidator> = {
    'Send Email': validateEmailNode,
    'Send SMS': validateSmsNode,
    'HTTP Request': validateHttpNode,
    'Webhook': validateWebhookNode,
    'Condition': validateConditionNode,
    'Transform': validateTransformNode,
    'Delay': validateDelayNode,
}

/**
 * Validates a single node based on its type
 * @param node - Node to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateNode(node: WorkflowNode): string[] {
    const validator = nodeValidators[node.data.label]
    return validator ? validator(node) : []
}

/**
 * Validates workflow structure (nodes, edges, requirements)
 * @param nodes - Array of workflow nodes
 * @returns Validation result with errors
 */
export function validateWorkflowStructure(
    nodes: WorkflowNode[]
): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for End node
    const endNode = nodes.find(n => n.data.label === 'End')
    if (!endNode) {
        errors.push('❌ Workflow must have an End node')
    }

    // Check for at least one trigger node
    const triggerNode = nodes.find(n => n.data.nodeType === 'trigger')
    if (!triggerNode) {
        errors.push('❌ Workflow must have at least one trigger node (Manual or Webhook)')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Validates all node configurations
 * @param nodes - Array of workflow nodes
 * @returns Array of all validation errors
 */
export function validateNodeConfigurations(nodes: WorkflowNode[]): string[] {

    const allErrors: string[] = []

    nodes.forEach(node => {
        const nodeErrors = validateNode(node)
        allErrors.push(...nodeErrors)
    })

    return allErrors
}

/**
 * Complete workflow validation
 * Validates both structure and node configurations
 * @param nodes - Array of workflow nodes
 * @returns Validation result with all errors
 */
export function validateCompleteWorkflow(
    nodes: WorkflowNode[]
): { valid: boolean; errors: string[] } {

    // Validate structure
    const structureValidation = validateWorkflowStructure(nodes)

    // Validate configurations
    const configErrors = validateNodeConfigurations(nodes)

    // Combine all errors
    const allErrors = [...structureValidation.errors, ...configErrors]

    const result = {
        valid: allErrors.length === 0,
        errors: allErrors
    }

    return result
}