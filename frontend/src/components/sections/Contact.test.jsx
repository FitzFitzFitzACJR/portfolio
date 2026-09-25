import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as api from '../../api'
import * as navigate from '../../lib/navigate'
import profile from '../../content/profile'
import Contact from './Contact'

vi.mock('../../api', async (importOriginal) => ({ ...(await importOriginal()), sendContactMessage: vi.fn() }))
vi.mock('../../lib/navigate', () => ({ openUrl: vi.fn() }))

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText('Name'), 'Jane Recruiter')
  await user.type(screen.getByLabelText('Email'), 'jane@example.com')
  await user.type(screen.getByLabelText('Message'), 'We would like to talk about a role.')
  await user.click(screen.getByRole('button', { name: 'Send message' }))
}

describe('Contact form', () => {
  it('validates fields, links errors to inputs and focuses the first invalid one', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    const name = screen.getByLabelText('Name')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Please enter your name.')
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(/valid email/)
    await vi.waitFor(() => expect(name).toHaveFocus())
    expect(api.sendContactMessage).not.toHaveBeenCalled()
  })

  it('sends the message and confirms', async () => {
    api.sendContactMessage.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<Contact />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent(/message was sent/)
    expect(api.sendContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane Recruiter', email: 'jane@example.com', website: '' })
    )
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('falls back to a prefilled mailto: link when email sending is not configured', async () => {
    api.sendContactMessage.mockRejectedValue(new api.ApiError('CONTACT_DISABLED'))
    const user = userEvent.setup()
    render(<Contact />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent(/opening your email app/i)
    const href = navigate.openUrl.mock.calls[0][0]
    expect(href.startsWith(`mailto:${profile.email}?subject=`)).toBe(true)
    expect(decodeURIComponent(href)).toContain('We would like to talk about a role.')
  })

  it('shows the server message when rate-limited', async () => {
    api.sendContactMessage.mockRejectedValue(new api.ApiError('RATE_LIMITED', 'Too many messages from your network.'))
    const user = userEvent.setup()
    render(<Contact />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent('Too many messages from your network.')
    expect(navigate.openUrl).not.toHaveBeenCalled()
  })
})
