import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwindcss-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date in relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return targetDate.toLocaleDateString()
}

/**
 * Generate a random UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Validate Namibian ID number format
 */
export function validateNamibianID(id: string): boolean {
  // Namibian ID format: 11 digits
  const namibianIDRegex = /^\d{11}$/
  return namibianIDRegex.test(id)
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^'s @]+@[^'s@]+\.[^'s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Namibian format)
 */
export function validateNamibianPhone(phone: string): boolean {
  // Namibian phone format: +264 followed by 8-9 digits
  const namibianPhoneRegex = /^(\+264|264)?[0-9]{8,9}$/
  return namibianPhoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Format Namibian phone number
 */
export function formatNamibianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('264')) {
    const number = cleaned.substring(3)
    return `+264 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
  }
  
  if (cleaned.length === 8 || cleaned.length === 9) {
    return `+264 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`
  }
  
  return phone
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Generate initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * ETA 2019 compliance utilities
 */
export const eta2019Utils = {
  /**
   * Check if document type requires advanced electronic signature
   */
  requiresAdvancedSignature(documentType: string): boolean {
    const advancedSignatureTypes = [
      'employment_contract',
      'service_agreement',
      'nda',
      'government_form'
    ]
    return advancedSignatureTypes.includes(documentType)
  },

  /**
   * Get retention period for document type (ETA 2019 Section 24)
   */
  getRetentionPeriod(documentType: string): number {
    const retentionPeriods: Record<string, number> = {
      'employment_contract': 7, // 7 years
      'service_agreement': 5,   // 5 years
      'nda': 25,               // 25 years (or indefinite)
      'government_form': 10,    // 10 years
      'default': 5             // 5 years default
    }
    return retentionPeriods[documentType] || retentionPeriods.default
  },

  /**
   * Check if consumer protection applies (ETA 2019 Chapter 4)
   */
  requiresConsumerProtection(documentType: string, parties: string[]): boolean {
    const consumerDocTypes = ['service_agreement', 'purchase_agreement']
    const hasConsumer = parties.some(party => party.includes('consumer') || party.includes('individual'))
    return consumerDocTypes.includes(documentType) && hasConsumer
  }
}
