/** Small list of technology chips. */
export default function TechList({ items, label = 'Technologies' }) {
  if (!items?.length) return null
  return (
    <ul className="flex flex-wrap gap-2" aria-label={label}>
      {items.map((item) => (
        <li key={item} className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
          {item}
        </li>
      ))}
    </ul>
  )
}
