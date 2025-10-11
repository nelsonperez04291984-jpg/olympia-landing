import React from 'react'
import { Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="py-12 bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpg" alt="Olympia Logo" className="w-10 h-10 object-contain rounded-full" />
              <span className="font-bold text-xl text-white">Olympia Home Health</span>
            </div>
            <p className="text-gray-500 max-w-md">
              Dedicated to delivering exceptional home health care services with compassion and expertise.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Services', 'Leadership', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="hover:text-purple-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              {[Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#contact"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Olympia Home Health Inc. — All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer