import React from 'react'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Leadership from './sections/Leadership'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import ChatWidget from './components/ChatWidget'
import ScrollToTop from './components/ScrollToTop'


export default function App(){
  return (
    <div className="font-sans text-gray-800">
      <ChatWidget />
      <ScrollToTop />
      <Hero />
      <main className="space-y-24">
        <About />
        <Services />
        <Leadership />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}