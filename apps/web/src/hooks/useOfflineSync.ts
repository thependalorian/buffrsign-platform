/**
 * useOfflineSync: detect network changes and trigger sync
 */

import { useEffect, useState } from 'react'

export function useOfflineSync(onReconnect?: () => void) {
	const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

	useEffect(() => {
		const onOnline = () => { setIsOnline(true); onReconnect?.() }
		const onOffline = () => setIsOnline(false)
		window.addEventListener('online', onOnline)
		window.addEventListener('offline', onOffline)
		return () => {
			window.removeEventListener('online', onOnline)
			window.removeEventListener('offline', onOffline)
		}
	}, [onReconnect])

	return { isOnline }
}
