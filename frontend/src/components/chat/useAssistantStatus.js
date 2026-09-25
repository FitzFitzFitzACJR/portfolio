import { useCallback, useEffect, useRef, useState } from 'react'
import { getChatStatus, pingHealth } from '../../api'

const WAKE_DEADLINE_MS = 75_000 // Render free instances can take ~30–60 s to cold-start
const WAKE_RETRY_MS = 3_000

const sleep = (ms, signal) =>
  new Promise((resolve) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => clearTimeout(t), { once: true })
  })

/**
 * Tracks whether the assistant can be used.
 * status: 'checking' → 'online' | 'offline'; if the backend doesn't answer quickly it moves
 * to 'waking' (polling /health) and finally 'unreachable'. Call retry() to try again.
 */
export default function useAssistantStatus() {
  const [status, setStatus] = useState('checking')
  const controllerRef = useRef(null)

  const check = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller

    const resolveStatus = async () => {
      const { enabled } = await getChatStatus({ signal })
      if (!signal.aborted) setStatus(enabled ? 'online' : 'offline')
    }

    setStatus('checking')
    try {
      await resolveStatus()
      return
    } catch {
      if (signal.aborted) return
    }

    // Probably a sleeping backend: keep poking /health until it's up.
    setStatus('waking')
    const deadline = Date.now() + WAKE_DEADLINE_MS
    while (!signal.aborted && Date.now() < deadline) {
      try {
        await pingHealth({ signal, timeoutMs: 10_000 })
        await resolveStatus()
        return
      } catch {
        if (signal.aborted) return
        await sleep(WAKE_RETRY_MS, signal)
      }
    }
    if (!signal.aborted) setStatus('unreachable')
  }, [])

  useEffect(() => {
    check()
    return () => controllerRef.current?.abort()
  }, [check])

  return { status, retry: check }
}
