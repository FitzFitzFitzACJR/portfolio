import { useCallback, useEffect, useRef, useState } from 'react';
import profile from '../../content/profile';
import { sendChatMessage, streamChatMessage } from '../../api';
import ChatMarkdown from './ChatMarkdown';
import StatusDot from './StatusDot';
import useFocusTrap from './useFocusTrap';
import { clearMessages, createMessageId, loadMessages, saveMessages } from './chatSession';

const MAX_LENGTH = 1000;
const HISTORY_TURNS = 10; // must match MAX_HISTORY_MESSAGES in backend/routes/chat.js

const ERROR_MESSAGES = {
  CHAT_DISABLED: `The assistant is offline right now. You can reach ${profile.firstName} at ${profile.email}.`,
  RATE_LIMITED: "You're sending messages quickly. Please wait a few minutes and try again.",
  DAILY_LIMIT: `The assistant has reached today's message limit. Please try again tomorrow, or email ${profile.firstName} at ${profile.email}.`,
  UPSTREAM_TIMEOUT: 'The assistant took too long to answer. Please try again.',
  UPSTREAM_ERROR: 'The assistant hit a snag. Please try again in a moment.',
  INVALID_INPUT: `That message couldn't be sent. Messages must be under ${MAX_LENGTH.toLocaleString()} characters.`,
  NETWORK: "Can't reach the assistant. Check your connection and try again.",
};
const errorMessage = (code) => ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UPSTREAM_ERROR;

const greetingMessage = () => ({ id: 'greeting', role: 'assistant', content: profile.assistant.greeting });

/** Completed turns to send as context (the backend is stateless). Skips the greeting and failed replies. */
const toHistory = (messages) =>
  messages
    .filter((m) => m.id !== 'greeting' && !m.pending && !m.error && m.content.trim())
    .slice(-HISTORY_TURNS)
    .map(({ role, content }) => ({ role, content }));

const STATUS_LABEL = {
  checking: 'Connecting…',
  waking: 'Waking up…',
  online: 'Online',
  offline: 'Offline',
  unreachable: 'Unavailable',
};

export default function ChatPanel({ open, status, onRetry, onClose }) {
  const [messages, setMessages] = useState(() => loadMessages() ?? [greetingMessage()]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const closeRef = useRef(null);

  const canChat = status === 'online';
  const showComposer = status !== 'offline' && status !== 'unreachable';

  useFocusTrap(panelRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    (showComposer ? inputRef.current : closeRef.current)?.focus();
  }, [open, showComposer]);

  useEffect(() => saveMessages(messages), [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = (id, update) => setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...update(m) } : m)));

  const send = useCallback(
    async (rawText) => {
      const text = rawText.trim();
      if (!text || busy || !canChat) return;

      const replyId = createMessageId();
      const history = toHistory(messages);
      setMessages((all) => [
        ...all,
        { id: createMessageId(), role: 'user', content: text },
        { id: replyId, role: 'assistant', content: '', pending: true },
      ]);
      setInput('');
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const request = { message: text, history, signal: controller.signal };
      const append = (chunk) => patch(replyId, (m) => ({ content: m.content + chunk }));

      try {
        try {
          await streamChatMessage({ ...request, onToken: append });
        } catch (err) {
          if (!err?.fallback) throw err;
          append(await sendChatMessage(request)); // streaming unavailable: use the plain endpoint
        }
        patch(replyId, () => ({ pending: false }));
      } catch (err) {
        if (controller.signal.aborted) patch(replyId, () => ({ pending: false, stopped: true }));
        else patch(replyId, () => ({ pending: false, error: err?.code ?? 'NETWORK' }));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
        // The Stop button unmounts here; don't leave keyboard focus on <body>.
        requestAnimationFrame(() => {
          if (!panelRef.current?.contains(document.activeElement)) inputRef.current?.focus();
        });
      }
    },
    [busy, canChat, messages]
  );

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    abortRef.current?.abort();
    clearMessages();
    setMessages([greetingMessage()]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(input);
    }
  };

  const showSuggestions = canChat && !busy && messages.length === 1;

  return (
    <div
      ref={panelRef}
      id="chat-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      className={`${open ? 'flex' : 'hidden'} fixed inset-0 z-50 flex-col bg-surface text-fg sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-line sm:shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-hero-from px-4 py-3 text-white">
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="truncate font-semibold">
            {profile.firstName}&apos;s AI Assistant
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-white/90">
            <StatusDot status={status} />
            {STATUS_LABEL[status]}
          </p>
        </div>
        <button
          type="button"
          onClick={newChat}
          disabled={messages.length === 1 && !busy}
          className="rounded-md px-2 py-1 text-sm font-medium hover:bg-white/15 focus-visible:outline-white disabled:opacity-60"
        >
          New chat
        </button>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-md p-1.5 hover:bg-white/15 focus-visible:outline-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={busy}
        aria-label="Conversation"
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      {(status === 'checking' || status === 'waking') && (
        <Notice>
          <span className="flex items-center gap-2">
            <span
              className="h-4 w-4 shrink-0 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin"
              aria-hidden="true"
            />
            {status === 'waking'
              ? 'Waking up the assistant… The server sleeps when idle, so this can take up to a minute.'
              : 'Connecting to the assistant…'}
          </span>
        </Notice>
      )}

      {status === 'offline' && (
        <Notice>
          <p className="mb-2">The assistant is offline right now, but you can reach {profile.firstName} directly:</p>
          <ContactLinks />
        </Notice>
      )}

      {status === 'unreachable' && (
        <Notice>
          <p className="mb-2">Couldn&apos;t reach the assistant. You can try again or contact {profile.firstName} directly:</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-accent-bg px-3 py-1.5 text-sm font-medium text-white hover:bg-hero-from"
            >
              Try again
            </button>
            <ContactLinks />
          </div>
        </Notice>
      )}

      {showSuggestions && (
        <div className="px-4 pb-2">
          <p className="mb-2 text-xs text-subtle" id="chat-suggestions-label">
            Try asking:
          </p>
          <ul className="flex flex-wrap gap-2" aria-labelledby="chat-suggestions-label">
            {profile.assistant.suggestedQuestions.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => send(question)}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-fg hover:border-accent hover:bg-accent-soft"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showComposer && (
        <form onSubmit={handleSubmit} className="border-t border-line p-3">
          <div className="flex items-end gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={input}
              maxLength={MAX_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canChat ? 'Ask about projects, skills, experience…' : 'Waiting for the assistant…'}
              className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-field px-3 py-2 text-sm [field-sizing:content] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop generating"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-field text-fg hover:bg-surface-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || !canChat}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-white hover:bg-hero-from disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
          {input.length >= MAX_LENGTH * 0.8 && (
            <p className="mt-1 text-right text-xs text-subtle">
              {input.length}/{MAX_LENGTH}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] break-words rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser ? 'rounded-br-md bg-accent-bg text-white' : 'rounded-bl-md bg-surface-2 text-fg'
        }`}
      >
        <span className="sr-only">{isUser ? 'You: ' : 'Assistant: '}</span>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.pending && !message.content ? (
          <TypingDots />
        ) : (
          message.content && <ChatMarkdown>{message.content}</ChatMarkdown>
        )}
        {message.stopped && <p className="mt-1 text-xs italic text-subtle">Stopped.</p>}
        {message.error && (
          <p className={`text-red-700 dark:text-red-300 ${message.content ? 'mt-2 border-t border-line pt-2 text-xs' : ''}`}>
            {errorMessage(message.error)}
          </p>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1" role="status">
      <span className="sr-only">Assistant is typing</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 rounded-full bg-gray-500 motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function Notice({ children }) {
  return <div className="mx-4 mb-3 rounded-lg border border-line bg-surface-2 p-3 text-sm text-fg">{children}</div>;
}

function ContactLinks() {
  const link =
    'font-medium text-accent underline underline-offset-2  ';
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      <a className={link} href={`mailto:${profile.email}`}>
        Email
      </a>
      <a className={link} href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a className={link} href={profile.socials.github} target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </span>
  );
}
