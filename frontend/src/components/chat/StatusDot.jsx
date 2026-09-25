export default function StatusDot({ status }) {
  const color =
    status === 'online'
      ? 'bg-emerald-400'
      : status === 'checking' || status === 'waking'
        ? 'bg-amber-300'
        : 'bg-gray-300';
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden="true" />;
}
