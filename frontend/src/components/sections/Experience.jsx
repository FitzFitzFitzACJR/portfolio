import profile from '../../content/profile'
import { formatPeriod } from '../../content/format'
import Reveal from '../Reveal'

// Experience and education in one timeline, most recent first.
function timelineItems() {
  const work = profile.experience.map((e) => ({
    key: `work-${e.organization}-${e.start}`,
    kind: e.type ?? 'Experience',
    title: e.role,
    place: e.organization,
    location: e.location,
    period: formatPeriod(e.start, e.end),
    sortKey: e.end ?? '9999',
    summary: e.summary,
    bullets: e.highlights,
    tech: e.tech,
  }))
  const school = profile.education.map((e) => ({
    key: `edu-${e.school}`,
    kind: 'Education',
    title: e.degree,
    place: e.school,
    location: e.location,
    period: formatPeriod(e.start, e.end),
    sortKey: e.end ?? '9999',
    bullets: e.notes,
  }))
  return [...work, ...school].sort((a, b) => b.sortKey.localeCompare(a.sortKey))
}

export default function Experience() {
  const items = timelineItems()
  return (
    <section id="experience" aria-labelledby="experience-title" className="bg-surface-2/50 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p className="eyebrow">Experience &amp; Education</p>
          <h2 id="experience-title" className="section-title mt-2">
            Where I&apos;ve worked and studied
          </h2>
        </Reveal>

        <ol className="relative mt-10 space-y-8 border-l-2 border-line pl-6 sm:pl-8">
          {items.map((item) => (
            <Reveal as="li" key={item.key} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-4 border-canvas bg-accent-bg sm:-left-[41px]"
              />
              <article className="card p-6">
                <p className="text-sm font-medium text-accent">
                  {item.kind} · <span className="text-subtle">{item.period}</span>
                </p>
                <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted">
                  {item.place}
                  {item.location ? `, ${item.location}` : ''}
                </p>
                {item.summary && <p className="mt-3 text-fg">{item.summary}</p>}
                {item.bullets?.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {item.tech?.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                    {item.tech.map((tech) => (
                      <li key={tech} className="chip">
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </ol>

        {profile.certifications?.length > 0 && (
          <Reveal className="mt-10">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <ul className="mt-3 space-y-1 text-muted">
              {profile.certifications.map((cert) => (
                <li key={cert.name}>
                  {cert.issuer}: {cert.name}
                  {cert.year ? ` (${cert.year})` : ''}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}
