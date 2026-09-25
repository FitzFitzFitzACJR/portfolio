import profile from '../../content/profile'
import Reveal from '../Reveal'

// Simple line icons per category (24x24, stroke). Unknown categories get the default.
const ICONS = {
  Frontend: 'M3 5h18v12H3zM8 21h8M12 17v4',
  Backend: 'M4 5h16v5H4zM4 14h16v5H4zM8 7.5h.01M8 16.5h.01',
  Databases:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  'Auth & Security': 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4',
  'AI Integration': 'M12 3v3M12 18v3M3 12h3M18 12h3M7 7h10v10H7zM10 10h4v4h-4z',
  'Tools & Deployment': 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.1-.7-.7-2.1z',
  'QA & Process': 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
}
const DEFAULT_ICON = 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5'

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="bg-surface-2/50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Skills</p>
          <h2 id="skills-title" className="section-title mt-2">
            What I work with
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Tools and practices I&apos;ve used in real projects, grouped by area.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profile.skills.map((group) => (
            <Reveal as="li" key={group.category} className="card p-6">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent"
                  aria-hidden="true"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d={ICONS[group.category] ?? DEFAULT_ICON} />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold">{group.category}</h3>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${group.category} skills`}>
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
