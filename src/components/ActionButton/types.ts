export type ButtonVariant = 'default' | 'primary' | 'danger' | 'success' | 'warning'

export type TooltipPosition = 'left' | 'right' | 'top' | 'bottom'

export interface ActionConfig {
  id: string
  icon: string
  tooltip: string
  disabled?: boolean
  variant?: ButtonVariant
  filled?: boolean
  onClick: () => void
  shortcut?: string
}

export interface TooltipConfig {
  text: string
  position?: TooltipPosition
  offsetX?: string
  offsetY?: string
}

export interface IconConfig {
  name: string
  size?: string
  filled?: boolean
}