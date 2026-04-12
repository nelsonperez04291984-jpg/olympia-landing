import React from 'react'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Leadership from './sections/Leadership'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import ChatWidget from './components/ChatWidget'
import AIFaq from './sections/AIFaq'
import Testimonials from './sections/Testimonials'
import ProviderLogin from './pages/ProviderLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import PublicReferral from './pages/PublicReferral'
import StatusPortal from './pages/StatusPortal'
import QRCodePage from './pages/QRCodePage'
import { Routes, Route } from 'react-router-dom'

const CustomCursor = () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = React.useState(false);

    React.useEffect(() => {
        const handleMouseMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
        const handleMouseOver = (e) => {
            if (e.target.closest('button, a, input, [role="button"]')) setIsHovering(true);
        };
        const handleMouseOut = (e) => setIsHovering(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', handleMouseOut);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    return (
        <div 
            className={`custom-cursor hidden lg:block ${isHovering ? 'cursor-active' : ''}`}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`, 
                transform: `translate(-50%, -50%) ${isHovering ? 'scale(2.5)' : 'scale(1)'}` 
            }}
        />
    );
};

const MainLanding = () => (
    <div className="relative">
        <div className="absolute inset-0 h-screen mesh-background opacity-30 mix-blend-soft-light pointer-events-none sticky top-0"></div>
        <Hero />
        <main className="relative z-10">
            <About />
            <Services />
            <AIFaq />
            <Testimonials />
            <Leadership />
            <Contact />
        </main>
    </div>
);

export default function App() {
  return (
    <div className="font-sans text-gray-800 overflow-x-hidden min-h-screen bg-[#0f172a] selection:bg-purple-500/30 selection:text-white">
      <CustomCursor />
      <ChatWidget />
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/referral/:token" element={<PublicReferral />} />
        <Route path="/referral-status/:token" element={<StatusPortal />} />
        <Route path="/qr" element={<QRCodePage />} />
      </Routes>
      <Footer />

      <style>{`
        .custom-cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          border: 2px solid #9333ea;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.2s ease;
        }
        .cursor-active {
          background: rgba(147, 51, 234, 0.2);
        }
        .mesh-background {
          background: radial-gradient(circle at 50% 50%, #7e22ce 0%, transparent 50%),
                      radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%),
                      radial-gradient(circle at 100% 100%, #ec4899 0%, transparent 50%);
          filter: blur(100px);
        }
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