import { useEffect, useRef } from 'react'

/**
 * Fades/slides children in when scrolled into view. The CSS in index.css only hides content when
 * JS is running and the visitor hasn't asked for reduced motion, so nothing is ever stuck hidden.
 */
export default function Reveal({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) {
      el.dataset.reveal = 'visible'
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = 'visible'
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref} data-reveal="hidden" {...props}>
      {children}
    </Tag>
  )
}
