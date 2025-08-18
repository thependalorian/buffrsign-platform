/**
 * useSmartValidation: realtime validation with suggestions
 */

import { useCallback, useState } from 'react'

export interface ValidationResult {
	valid: boolean
	message?: string
	suggestions?: string[]
}

export function useSmartValidation(validator: (value: string) => ValidationResult) {
	const [result, setResult] = useState<ValidationResult>({ valid: true })

	const validate = useCallback((value: string) => {
		const res = validator(value)
		setResult(res)
		return res
	}, [validator])

	return { result, validate }
}
