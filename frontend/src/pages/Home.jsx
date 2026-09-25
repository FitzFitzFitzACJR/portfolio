import Hero from '../components/Hero'
import Projects from '../components/projects/Projects'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Projects />
      <Footer />
    </div>
  )
}

export default Home

