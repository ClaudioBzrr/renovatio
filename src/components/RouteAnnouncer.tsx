import { useEffect, useRef, useState } from 'react'

interface RouteAnnouncerProps {
  /** Message for the current route. */
  message: string
  /** Route key; a change triggers a fresh announcement. */
  route: string
}

/**
 * Polite live region for client-side route changes. The empty state before
 * the message is important: some screen readers only announce changed text.
 */
export function RouteAnnouncer({ message, route }: RouteAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('')
  const previousRoute = useRef(route)
  const messageRef = useRef(message)
  messageRef.current = message

  useEffect(() => {
    if (previousRoute.current === route) return
    previousRoute.current = route
    setAnnouncement('')
    const timer = window.setTimeout(() => setAnnouncement(messageRef.current), 80)
    return () => window.clearTimeout(timer)
  }, [route])

  return (
    <div
      className="visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>
  )
}
