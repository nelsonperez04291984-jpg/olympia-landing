import React from 'react'
import { animateScroll as scroll } from 'react-scroll'

const ScrollToTop = () => {
  const [visible, setVisible] = React.useState(false)
  
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => scroll.scrollToTop({ smooth: true, duration: 600 })}
      className={`fixed right-6 bottom-8 bg-olympiaPurple text-white p-3 rounded-full shadow-lg transform transition-opacity ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  )
}

export default ScrollToTop