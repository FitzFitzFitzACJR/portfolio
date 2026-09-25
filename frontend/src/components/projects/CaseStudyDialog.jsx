import { useEffect, useRef } from 'react'
import TechList from './TechList'
import { ProjectLinks } from './FeaturedProjectCard'

/**
 * Case study for a featured project: problem → role → what was built → tech → outcome.
 * Uses the native <dialog> (modal focus handling, Escape to close, inert background).
 */
export default function CaseStudyDialog({ project, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (project && dialog && !dialog.open) dialog.showModal()
  }, [project])

  if (!project) return null

  const builtHeading = project.team ? 'What we built' : 'What I built'
  const titleId = `case-study-${project.slug}`

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close() // backdrop click
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-surface p-0 text-fg backdrop:bg-black/60 sm:m-auto sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl sm:shadow-2xl"
    >
      <div className="flex h-full flex-col sm:max-h-[85vh]">
        <header className="flex items-start gap-4 border-b border-line p-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-accent">
              {[project.badge, project.team ? 'Team project' : null].filter(Boolean).join(' · ')}
            </p>
            <h2 id={titleId} className="mt-1 text-2xl font-bold">
              {project.name}
            </h2>
            <p className="mt-2 text-muted">{project.description}</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close case study"
            className="rounded-md p-1.5 text-muted hover:bg-surface-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {project.problem && (
            <Section title="The problem">
              <p>{project.problem}</p>
            </Section>
          )}

          <Section title="My role">
            <p className="font-medium">
              {project.role}
              {project.teamSize ? ` · team of ${project.teamSize}` : ''}
            </p>
            <BulletList items={project.contribution} />
          </Section>

          {project.built?.length > 0 && (
            <Section title={builtHeading}>
              <BulletList items={project.built} />
            </Section>
          )}

          <Section title="Tech">
            <TechList items={project.tech} label={`${project.name} technologies`} />
          </Section>

          {project.outcome && (
            <Section title="Outcome & lessons">
              <p>{project.outcome}</p>
            </Section>
          )}

          {project.team && project.repo && (
            <p className="text-sm text-subtle">
              Team project. The repository is owned by {project.repo.owner}.
            </p>
          )}
        </div>

        <footer className="border-t border-line p-6">
          <ProjectLinks project={project} />
        </footer>
      </div>
    </dialog>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle">{title}</h3>
      <div className="text-fg">{children}</div>
    </section>
  )
}

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
