import { timeAgo } from './timeAgo'

/** A public GitHub repo from the backend feed. The whole card links to the repository. */
export default function RepoCard({ repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
    >
      <h4 className="font-semibold text-gray-900 group-hover:text-primary-800">
        {repo.name}
        <span className="sr-only"> on GitHub (opens in a new tab)</span>
      </h4>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-700">{repo.description || 'No description yet.'}</p>
      <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
        {repo.language && <span>{repo.language}</span>}
        <span aria-label={`${repo.stars} stars`}>★ {repo.stars}</span>
        {repo.pushedAt && (
          <span>
            Updated <time dateTime={repo.pushedAt}>{timeAgo(repo.pushedAt)}</time>
          </span>
        )}
      </p>
    </a>
  )
}

export function RepoCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5" aria-hidden="true">
      <div className="h-4 w-1/2 rounded bg-gray-200 motion-safe:animate-pulse" />
      <div className="mt-4 h-3 w-full rounded bg-gray-100 motion-safe:animate-pulse" />
      <div className="mt-2 h-3 w-4/5 rounded bg-gray-100 motion-safe:animate-pulse" />
      <div className="mt-6 h-3 w-1/3 rounded bg-gray-100 motion-safe:animate-pulse" />
    </div>
  )
}
