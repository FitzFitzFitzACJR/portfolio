import TechList from './TechList'
import { timeAgo } from './timeAgo'

export const linkClass =
  'inline-flex items-center gap-1 font-medium text-primary-800 underline-offset-2 hover:text-primary-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700'

export function ExternalIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  )
}

/** Links shared by the card and the case-study dialog. */
export function ProjectLinks({ project }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {project.repo ? (
        <a className={linkClass} href={project.repo.url} target="_blank" rel="noopener noreferrer">
          Code
          <ExternalIcon />
          <span className="sr-only"> for {project.name} on GitHub (opens in a new tab)</span>
        </a>
      ) : (
        project.private && <span className="text-gray-600">Private repository</span>
      )}
      {project.liveUrl && (
        <a className={linkClass} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
          Live demo
          <ExternalIcon />
          <span className="sr-only"> of {project.name} (opens in a new tab)</span>
        </a>
      )}
    </div>
  )
}

/**
 * @param {object} props
 * @param {object} props.project - entry from profile.featuredProjects
 * @param {object} [props.meta] - live GitHub metadata for team repos (language, stars, pushedAt)
 * @param {(project, trigger: HTMLElement) => void} props.onOpenCaseStudy
 */
export default function FeaturedProjectCard({ project, meta, onOpenCaseStudy }) {
  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-medium">
        {project.badge && <span className="rounded-full bg-primary-50 px-2.5 py-1 text-primary-800">{project.badge}</span>}
        {project.team && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-800">Team project</span>}
      </div>

      <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
      {project.role && <p className="mt-1 text-sm font-medium text-gray-700">{project.role}</p>}
      <p className="mt-3 flex-1 text-gray-700">{project.description}</p>

      <div className="mt-4">
        <TechList items={project.tech} label={`${project.name} technologies`} />
      </div>

      {meta && (
        <p className="mt-3 text-xs text-gray-600">
          {[
            project.repo && project.team ? `Repository by ${project.repo.owner}` : null,
            meta.language,
            meta.pushedAt ? `updated ${timeAgo(meta.pushedAt)}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={(event) => onOpenCaseStudy(project, event.currentTarget)}
          aria-haspopup="dialog"
          className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          Case study<span className="sr-only">: {project.name}</span>
        </button>
        <ProjectLinks project={project} />
      </div>
    </article>
  )
}
