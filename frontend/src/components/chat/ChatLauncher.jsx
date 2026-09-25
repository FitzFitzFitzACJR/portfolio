import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import StatusDot from './StatusDot';
import useAssistantStatus from './useAssistantStatus';
import { OPEN_CHAT_EVENT } from './openChat';

// The panel (and react-markdown) is only downloaded when first needed.
const loadPanel = () => import('./ChatPanel');
const ChatPanel = lazy(loadPanel);

const LAUNCHER_LABEL = {
  checking: 'Open AI assistant',
  waking: 'Open AI assistant (waking up)',
  online: 'Open AI assistant',
  offline: 'Open AI assistant (offline)',
  unreachable: 'Open AI assistant (unavailable)',
};

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  // Keep the panel mounted after first open so a reply keeps streaming while it's closed.
  const [mounted, setMounted] = useState(false);
  const { status, retry } = useAssistantStatus();
  const buttonRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const show = () => {
    setMounted(true);
    if (status === 'unreachable') retry();
    setOpen(true);
  };
  const toggle = () => (open ? setOpen(false) : show());

  // Other components (e.g. the hero's "Ask my AI assistant") open the panel via openChat().
  const showRef = useRef(show);
  showRef.current = show;
  useEffect(() => {
    const onOpen = () => {
      loadPanel();
      showRef.current();
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        aria-label={open ? 'Close AI assistant' : LAUNCHER_LABEL[status]}
        aria-expanded={open}
        aria-controls={mounted ? 'chat-panel' : undefined}
        aria-haspopup="dialog"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-bg text-white shadow-lg transition-transform hover:bg-hero-from motion-safe:hover:scale-105"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
        <span className="absolute right-0.5 top-0.5 rounded-full ring-2 ring-white">
          <StatusDot status={status} />
        </span>
      </button>

      {mounted && (
        <Suspense fallback={open ? <PanelLoading /> : null}>
          <ChatPanel open={open} status={status} onRetry={retry} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

function PanelLoading() {
  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface text-sm text-muted sm:inset-auto sm:bottom-24 sm:right-6 sm:h-40 sm:w-[400px] sm:rounded-2xl sm:border sm:border-line sm:shadow-2xl"
    >
      Loading assistant…
    </div>
  );
}
