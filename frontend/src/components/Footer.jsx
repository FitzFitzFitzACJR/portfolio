const Footer = () => {
  const githubUrl = import.meta.env.VITE_GITHUB_PROFILE_URL || 'https://github.com/FitzFitzFitz69'
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Arnold Cutad Jr.</h3>
            <p className="text-gray-400">
              IT Student at University of Cebu Main
            </p>
            <p className="text-gray-400">
              Philippines
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#home"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 mb-2">
              Have a question? Use the AI chatbot assistant!
            </p>
            <p className="text-gray-400">
              Or visit my GitHub profile for more information.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Arnold Cutad Jr. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Built with React, Node.js, and Flowise AI
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

