import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 bottom-8 z-50 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}
      aria-label="Scroll to top"
    >
      <ChevronDown className="rotate-180" size={20} />
    </button>
  )
}

export default ScrollToTop