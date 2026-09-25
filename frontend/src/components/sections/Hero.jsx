import profile from '../../content/profile'
import { openChat } from '../chat/openChat'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-hero-from to-hero-to text-white">
      {/* Decorative glow in the original brand pink (radial gradients: far cheaper to paint than blur filters). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,rgb(247_180_198/0.30),transparent_42%),radial-gradient(circle_at_6%_100%,rgb(247_180_198/0.18),transparent_38%)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-[1fr_auto] md:py-28">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/85">{profile.headline}</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl md:text-6xl">{profile.name}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 md:mx-0">{profile.summary}</p>

          {profile.availability && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
              {profile.availability}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <a href="#projects" className="btn bg-white text-[#5e1f38] hover:bg-white/90">
              View projects
            </a>
            {profile.resume && (
              <a href={profile.resume} download className="btn border border-white/60 text-white hover:bg-white/10">
                Download résumé
                <span className="sr-only"> (PDF)</span>
              </a>
            )}
            <button type="button" onClick={openChat} className="btn text-white underline-offset-4 hover:underline">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Ask my AI assistant
            </button>
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <img
            src={profile.avatar.src}
            srcSet={profile.avatar.srcSet}
            sizes="(min-width: 768px) 240px, 160px"
            width={profile.avatar.width}
            height={profile.avatar.height}
            alt={profile.avatar.alt}
            // React 18 drops the camelCase `fetchPriority` prop; the lowercase attribute reaches the DOM.
            // eslint-disable-next-line react/no-unknown-property
            fetchpriority="high"
            className="h-40 w-40 rounded-full object-cover shadow-2xl ring-4 ring-white/25 md:h-60 md:w-60"
          />
        </div>
      </div>
    </section>
  )
}
