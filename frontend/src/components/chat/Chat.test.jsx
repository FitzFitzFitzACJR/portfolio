import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as api from '../../api'
import ChatLauncher from './ChatLauncher'

vi.mock('../../api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getChatStatus: vi.fn(),
    pingHealth: vi.fn(),
    sendChatMessage: vi.fn(),
    streamChatMessage: vi.fn(),
  }
})

async function openChat(user) {
  render(<ChatLauncher />)
  await user.click(screen.getByRole('button', { name: /open ai assistant/i }))
  return screen.findByRole('dialog', { name: /ai assistant/i })
}

beforeEach(() => {
  api.getChatStatus.mockResolvedValue({ enabled: true })
})

describe('Chatbot', () => {
  it('sends a suggested question immediately and streams the markdown reply', async () => {
    api.streamChatMessage.mockImplementation(async ({ onToken }) => {
      onToken('**WEBeenThere** ')
      onToken('was his capstone.')
    })
    const user = userEvent.setup()
    const dialog = await openChat(user)
    await within(dialog).findByText('Online')

    await user.click(within(dialog).getByRole('button', { name: 'What was his capstone project?' }))

    expect(await within(dialog).findByText('WEBeenThere')).toBeInTheDocument()
    expect(within(dialog).getByText('WEBeenThere').tagName).toBe('STRONG')
    expect(api.streamChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'What was his capstone project?', history: [] })
    )
  })

  it('sends earlier turns as history (without the greeting)', async () => {
    api.streamChatMessage.mockImplementation(async ({ onToken }) => onToken('First answer'))
    const user = userEvent.setup()
    const dialog = await openChat(user)
    await within(dialog).findByText('Online')
    const input = within(dialog).getByLabelText('Message')

    await user.type(input, 'First question{Enter}')
    await within(dialog).findByText('First answer')
    await user.type(input, 'Follow-up{Enter}')

    await waitFor(() => expect(api.streamChatMessage).toHaveBeenCalledTimes(2))
    expect(api.streamChatMessage.mock.calls[1][0].history).toEqual([
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
    ])
  })

  it('shows a friendly message for error codes instead of raw errors', async () => {
    api.streamChatMessage.mockRejectedValue(new api.ApiError('RATE_LIMITED', 'raw server text'))
    const user = userEvent.setup()
    const dialog = await openChat(user)
    await within(dialog).findByText('Online')
    await user.type(within(dialog).getByLabelText('Message'), 'Hi{Enter}')

    expect(await within(dialog).findByText(/sending messages quickly/i)).toBeInTheDocument()
    expect(within(dialog).queryByText('raw server text')).not.toBeInTheDocument()
  })

  it('falls back to the non-streaming endpoint when streaming is unavailable', async () => {
    api.streamChatMessage.mockRejectedValue(new api.ApiError('STREAM_UNAVAILABLE', '', { fallback: true }))
    api.sendChatMessage.mockResolvedValue('Plain reply')
    const user = userEvent.setup()
    const dialog = await openChat(user)
    await within(dialog).findByText('Online')
    await user.type(within(dialog).getByLabelText('Message'), 'Hi{Enter}')

    expect(await within(dialog).findByText('Plain reply')).toBeInTheDocument()
  })

  it('shows an offline state with contact links when the assistant is disabled', async () => {
    api.getChatStatus.mockResolvedValue({ enabled: false })
    const user = userEvent.setup()
    const dialog = await openChat(user)

    expect(await within(dialog).findByText(/offline right now/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/)
    )
    expect(within(dialog).queryByLabelText('Message')).not.toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the launcher', async () => {
    const user = userEvent.setup()
    await openChat(user)
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /open ai assistant/i })).toHaveFocus()
  })
})
