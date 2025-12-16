const Hero = () => {
  const skills = [
    'React',
    'Node.js',
    'Express',
    'JavaScript',
    'TypeScript',
    'Tailwind CSS',
    'MongoDB',
    'PostgreSQL',
    'Git',
    'REST APIs',
    'Vite',
    'Web Development'
  ]

  return (
    <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
              <img 
                src="https://raw.githubusercontent.com/FitzFitzFitz69/pic/main/994540f3-43ee-41d6-a692-72841d021de2.jpg" 
                alt="Arnold Cutad Jr." 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-4xl font-bold text-white/50">
                AC
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Arnold Cutad Jr.
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-6">
              IT Student at University of Cebu Main
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-2xl">
              Passionate web developer from the Philippines, building modern and scalable web applications 
              with cutting-edge technologies. Currently pursuing my IT degree while developing real-world projects.
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {skills.map((skill, index) => (
                <span
                  key={index}
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

