import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchGitHubRepos } from '../../api'
import profile from '../../content/profile'
import CaseStudyDialog from './CaseStudyDialog'
import FeaturedProjectCard, { ExternalIcon, linkClass } from './FeaturedProjectCard'
import RepoCard, { RepoCardSkeleton } from './RepoCard'
import Reveal from '../Reveal'

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
    <section id="projects" aria-labelledby="projects-title" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10">
          <p className="eyebrow">Projects</p>
          <h2 id="projects-title" className="section-title mt-2">
            Featured projects
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Selected work, from a team capstone I managed to tools I built on my own. Open a case study for the details.
          </p>
        </Reveal>

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
        <h3 id="more-projects-title" className="text-2xl font-bold">
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
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-5 text-fg">
            <p className="flex-1">Couldn&apos;t load projects from GitHub right now.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-field px-4 py-2 text-sm font-medium hover:bg-surface-2"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && repos.length === 0 && (
          <p className="text-muted">
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
