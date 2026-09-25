import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as api from '../../api'
import profile from '../../content/profile'
import Projects from './Projects'

vi.mock('../../api', async (importOriginal) => ({ ...(await importOriginal()), fetchGitHubRepos: vi.fn() }))

const repo = {
  id: 1,
  name: 'angular-demo',
  fullName: 'me/angular-demo',
  description: 'A demo',
  url: 'https://github.com/me/angular-demo',
  language: 'TypeScript',
  stars: 3,
  pushedAt: new Date().toISOString(),
}

const moreSection = () => screen.getByRole('region', { name: 'More on GitHub' })

describe('Projects', () => {
  it('always shows featured projects from the profile', () => {
    api.fetchGitHubRepos.mockReturnValue(new Promise(() => {}))
    render(<Projects />)
    for (const project of profile.featuredProjects) {
      expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument()
    }
  })

  it('shows skeletons while loading, then GitHub repo cards', async () => {
    let resolve
    api.fetchGitHubRepos.mockReturnValue(new Promise((r) => (resolve = r)))
    render(<Projects />)
    expect(within(moreSection()).getByText(/loading projects/i)).toBeInTheDocument()

    resolve({ repos: [repo], external: [] })
    expect(await within(moreSection()).findByRole('link', { name: /angular-demo/ })).toHaveAttribute('href', repo.url)
  })

  it('shows an error with a working retry', async () => {
    api.fetchGitHubRepos
      .mockRejectedValueOnce(new api.ApiError('NETWORK'))
      .mockResolvedValueOnce({ repos: [repo], external: [] })
    const user = userEvent.setup()
    render(<Projects />)

    await user.click(await within(moreSection()).findByRole('button', { name: 'Try again' }))
    expect(await within(moreSection()).findByRole('link', { name: /angular-demo/ })).toBeInTheDocument()
    expect(api.fetchGitHubRepos).toHaveBeenCalledTimes(2)
  })

  it('shows team repo metadata and opens a case study dialog', async () => {
    const team = profile.featuredProjects.find((p) => p.team && p.repo)
    api.fetchGitHubRepos.mockResolvedValue({
      repos: [],
      external: [{ ...repo, fullName: `${team.repo.owner}/${team.repo.name}`, language: 'TypeScript' }],
    })
    const user = userEvent.setup()
    render(<Projects />)

    expect(await screen.findByText(new RegExp(`Repository by ${team.repo.owner}`))).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: `Case study: ${team.name}` }))
    const dialog = screen.getByRole('dialog', { name: team.name })
    expect(within(dialog).getByRole('heading', { name: 'My role' })).toBeInTheDocument()
    expect(within(dialog).getByText(team.role)).toBeInTheDocument()
  })
})
