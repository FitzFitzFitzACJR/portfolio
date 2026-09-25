import profile from '../content/profile'

const linkClass = 'text-gray-300 hover:text-white underline-offset-2 hover:underline transition-colors'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">{profile.name}</h2>
            <p className="text-gray-300">{profile.title}</p>
            <p className="text-gray-300">{profile.location}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="#home" className={linkClass}>
                  Home
                </a>
              </li>
              <li>
                <a href="#projects" className={linkClass}>
                  Projects
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <ul className="space-y-2">
              <li>
                <a href={`mailto:${profile.email}`} className={linkClass}>
                  {profile.email}
                </a>
              </li>
              <li>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  GitHub
                </a>
              </li>
            </ul>
            <p className="text-gray-300 mt-4">Or ask the AI assistant (bottom-right corner).</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-300">
          <p>
            &copy; {currentYear} {profile.name.replace(/\.$/, '')}. All rights reserved.
          </p>
          <p className="mt-2 text-sm">Built with React, Node.js, and the Claude API</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
