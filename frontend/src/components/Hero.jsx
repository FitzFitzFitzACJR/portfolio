import profile from '../content/profile'

const initials = profile.name
  .split(' ')
  .filter((word) => /^[A-Z]/.test(word) && !/^(Jr|Sr)\.?$/.test(word))
  .map((word) => word[0])
  .join('')

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
              <img
                src={profile.avatar.src}
                alt={profile.avatar.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-4xl font-bold text-white/50">
                {initials}
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {profile.name}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-6">
              {profile.headline}
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-2xl">
              {profile.summary}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {profile.featuredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

