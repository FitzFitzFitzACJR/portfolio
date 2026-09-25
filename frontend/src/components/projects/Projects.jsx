import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchGitHubRepos } from '../../api'
import profile from '../../content/profile'
import CaseStudyDialog from './CaseStudyDialog'
import FeaturedProjectCard, { ExternalIcon, linkClass } from './FeaturedProjectCard'
import RepoCard, { RepoCardSkeleton } from './RepoCard'

const MORE_LIMIT = 6

const repoKey = (owner, name) => `${owner}/${name}`.toLowerCase()

export default function Projects() {
  // GitHub feed: "More on GitHub" repos + live metadata for featured team repos.
  const [feed, setFeed] = useState({ status: 'loading', repos: [], external: [] })
  const [caseStudy, setCaseStudy] = useState(null)
  const triggerRef = useRef(null)
  const controllerRef = useRef(null)

  const load = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setFeed((previous) => ({ ...previous, status: 'loading' }))
    try {
      const data = await fetchGitHubRepos({ limit: MORE_LIMIT, signal: controller.signal })
      setFeed({ status: 'ready', repos: data.repos ?? [], external: data.external ?? [] })
    } catch (err) {
      if (!controller.signal.aborted) setFeed((previous) => ({ ...previous, status: 'error' }))
    }
  }, [])

  useEffect(() => {
    load()
    return () => controllerRef.current?.abort()
  }, [load])

  const externalMeta = new Map(feed.external.map((repo) => [repo.fullName.toLowerCase(), repo]))

  const openCaseStudy = (project, trigger) => {
    triggerRef.current = trigger
    setCaseStudy(project)
  }
  const closeCaseStudy = () => {
    setCaseStudy(null)
    triggerRef.current?.focus()
  }

  return (
    <section id="projects" aria-labelledby="projects-title" className="bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="projects-title" className="mb-4 text-center text-4xl font-bold text-gray-900">
          Featured Projects
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-gray-700">
          Selected work, from a team capstone I managed to tools I built on my own. Open a case study for the details.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {profile.featuredProjects.map((project) => (
            <FeaturedProjectCard
              key={project.slug}
              project={project}
              meta={project.team && project.repo ? externalMeta.get(repoKey(project.repo.owner, project.repo.name)) : null}
              onOpenCaseStudy={openCaseStudy}
            />
          ))}
        </div>

        <MoreOnGitHub feed={feed} onRetry={load} />
      </div>

      <CaseStudyDialog project={caseStudy} onClose={closeCaseStudy} />
    </section>
  )
}

function MoreOnGitHub({ feed, onRetry }) {
  const { status, repos } = feed
  const profileLink = (
    <a className={linkClass} href={profile.socials.github} target="_blank" rel="noopener noreferrer">
      View all on GitHub
      <ExternalIcon />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )

  return (
    <section className="mt-20" aria-labelledby="more-projects-title">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h3 id="more-projects-title" className="text-2xl font-bold text-gray-900">
          More on GitHub
        </h3>
        {profileLink}
      </div>

      <div aria-live="polite" aria-busy={status === 'loading'}>
        {status === 'loading' && (
          <>
            <span className="sr-only">Loading projects from GitHub…</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <RepoCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 text-gray-800">
            <p className="flex-1">Couldn&apos;t load projects from GitHub right now.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-gray-400 px-4 py-2 text-sm font-medium hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && repos.length === 0 && (
          <p className="text-gray-700">
            Everything public right now is featured above. New repositories will show up here automatically.
          </p>
        )}

        {status === 'ready' && repos.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <li key={repo.id}>
                <RepoCard repo={repo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
