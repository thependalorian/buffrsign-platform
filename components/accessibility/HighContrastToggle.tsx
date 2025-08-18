/**
 * HighContrastToggle: Toggle high contrast mode for accessibility
 * Location: components/accessibility/HighContrastToggle.tsx
 */

import React from 'react'
import { Contrast } from 'lucide-react'

export interface HighContrastToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export const HighContrastToggle: React.FC<HighContrastToggleProps> = ({ 
  className, 
  enabled, 
  onToggle, 
  ...props 
}) => {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`btn btn-sm btn-ghost ${enabled ? 'btn-active' : ''} ${className}`}
      aria-label={enabled ? 'Disable high contrast' : 'Enable high contrast'}
      {...props}
    >
      <Contrast className="w-4 h-4" />
      <span className="sr-only">
        {enabled ? 'High contrast enabled' : 'High contrast disabled'}
      </span>
    </button>
  )
}

HighContrastToggle.displayName = 'HighContrastToggle'
