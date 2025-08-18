/**
 * useAutosave: periodically saves data and indicates state
 */

import { useEffect, useRef, useState } from 'react'

export function useAutosave<T>(value: T, onSave: (value: T) => Promise<void>, intervalMs = 5000) {
	const [saving, setSaving] = useState(false)
	const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
	const timer = useRef<NodeJS.Timeout | null>(null)
	const latest = useRef(value)
	latest.current = value

	useEffect(() => {
		if (timer.current) clearInterval(timer.current)
		timer.current = setInterval(async () => {
			try {
				setSaving(true)
				await onSave(latest.current)
				setLastSavedAt(Date.now())
			} finally {
				setSaving(false)
			}
		}, intervalMs)
		return () => { if (timer.current) clearInterval(timer.current) }
	}, [intervalMs, onSave])

	return { saving, lastSavedAt }
}
