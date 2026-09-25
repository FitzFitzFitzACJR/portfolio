import profile from '../../content/profile'
import Reveal from '../Reveal'

export default function About() {
  const facts = [
    ['Based in', profile.location],
    ['Education', profile.status],
    ['Focus', profile.title],
    ['Looking for', profile.availability],
  ].filter(([, value]) => value)

  return (
    <section id="about" aria-labelledby="about-title" className="px-4 py-20">
      <Reveal className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[3fr_2fr]">
        <div>
          <p className="eyebrow">About</p>
          <h2 id="about-title" className="section-title mt-2">
            A developer who plans, builds and tests
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside aria-label="Quick facts" className="card h-fit p-6">
          <dl className="space-y-4">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-medium text-subtle">{label}</dt>
                <dd className="mt-0.5 text-fg">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm font-medium text-subtle">Email</dt>
              <dd className="mt-0.5">
                <a className="link break-all" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </Reveal>
    </section>
  )
}
