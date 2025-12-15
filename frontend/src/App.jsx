import { useState } from 'react'
import Home from './pages/Home'
import Chatbot from './components/Chatbot'

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Home />
      <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
    </div>
  )
}

export default App

