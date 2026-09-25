import profile from '../../content/profile'
import { NAV_ITEMS } from './Navbar'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line bg-surface px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-bold">{profile.name}</p>
          <p className="text-sm text-muted">
            {profile.title} · {profile.location}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-muted hover:text-fg">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-sm text-subtle">
        &copy; {year} {profile.name.replace(/\.$/, '')}. Built with React, Node.js and the Claude API.
      </p>
    </footer>
  )
}
