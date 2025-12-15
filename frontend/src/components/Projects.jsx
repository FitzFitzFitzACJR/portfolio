import { useState, useEffect } from 'react'
import { fetchGitHubRepos } from '../api'

const Projects = () => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const githubUrl = import.meta.env.VITE_GITHUB_PROFILE_URL || 'https://github.com/FitzFitzFitz69'

  useEffect(() => {
    const loadRepos = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedRepos = await fetchGitHubRepos(6)
        setRepos(fetchedRepos)
      } catch (err) {
        console.error('Failed to load projects:', err)
        // Don't show error, just use empty array
        setRepos([])
      } finally {
        setLoading(false)
      }
    }

    loadRepos()
  }, [])

  const getStatus = (status) => {
    return status || 'Active'
  }

  return (
    <section id="projects" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
          Projects
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Here are some of my recent projects from GitHub. Visit my profile to see more of my work.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          </div>
        )}

        {!loading && repos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all hover:border-primary-300 block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {repo.name}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full ml-2 whitespace-nowrap">
                      {getStatus(repo.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {repo.description}
                  </p>

                  {repo.languages && repo.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View on GitHub
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View All on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

export default Projects

