import React from 'react'
import { Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="py-12 bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-3">
                <img src="/log_latest.png" alt="Olympia Logo" className="w-10 h-10 object-contain rounded-full" />
                <span className="font-bold text-xl text-white">Olympia Home Health</span>
              </div>
              <div className="h-8 w-px bg-gray-700 mx-2 hidden sm:block"></div>
              <div className="achc-seal-container achc-seal-shadow-dark w-12 h-12">
                <img src="/ACHC.png" alt="ACHC Accredited" />
              </div>
            </div>
            <p className="text-gray-500 max-w-md mb-4">
              Caring Beyond Limits - Provides the highest quality of healthcare professionals in the comfort of your home.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>20422 Beach Blvd, Suite 320</p>
              <p>Huntington Beach, CA 92648</p>
              <p>Phone: (657) 377-0776</p>
              <p>Fax: (714) 465-2233</p>
            </div>
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
              <li>
                <hr className="border-gray-800 my-2 w-1/2" />
              </li>
              <li>
                <a href="/provider-login" className="hover:text-teal-400 transition-colors text-sm">
                  Provider Portal
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-amber-400 transition-colors text-xs opacity-60">
                  Staff Login
                </a>
              </li>
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

          <div>
            <h4 className="text-white font-semibold mb-4">Scan & Visit</h4>
            <Link to="/qr" className="inline-block p-3 bg-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105">
              <img
                src="/Olympia Home Health Inc.png"
                alt="Scan to share"
                className="w-24 h-24 object-contain"
              />
            </Link>
            <p className="text-xs text-gray-500 mt-2">Scan or click to share</p>
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