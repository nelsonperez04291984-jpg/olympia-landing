import React from 'react'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Leadership from './sections/Leadership'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import ScrollToTop from './components/ScrollToTop'
import ChatWidget from './components/ChatWidget'
import AIFaq from './sections/AIFaq'
import Testimonials from './sections/Testimonials'
import ProviderLogin from './pages/ProviderLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import QRCodePage from './pages/QRCodePage'
import { Routes, Route } from 'react-router-dom'

const MainLanding = () => (
  <>
    <Hero />
    <main>
      <About />
      <Services />
      <AIFaq />
      <Testimonials />
      <Leadership />
      <Contact />
    </main>
  </>
);

export default function App() {
  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      <ChatWidget />
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/qr" element={<QRCodePage />} />
      </Routes>
      <Footer />
      <ScrollToTop />
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #7e22ce);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #6b21a8);
        }
      `}</style>
    </div>
  )
}