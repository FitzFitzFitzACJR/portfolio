import { useEffect, useState } from 'react'

const OFFSET = 120 // px below the viewport top (sticky navbar height + breathing room)

/**
 * Id of the section currently being read, for navbar highlighting: the last section whose top has
 * scrolled past just below the navbar (or the last section once the page bottom is reached).
 * Position-based rather than IntersectionObserver so long jumps via anchor links stay accurate.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= OFFSET) current = id
      }
      if (atBottom && ids.length) current = ids[ids.length - 1]
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}
