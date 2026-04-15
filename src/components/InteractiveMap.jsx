import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Globe, Map as MapIcon, Zap } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

const InteractiveMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isGlobe, setIsGlobe] = useState(true); // Default to Globe for 'Wow' factor
  const rotationRef = useRef(null);

  const locations = [
    { name: 'Olympia HQ', coords: [-117.9530, 33.6846], color: '#7c3aed', isHQ: true },
    { name: 'Orange County', coords: [-117.8265, 33.7175], color: '#a855f7', isHQ: false },
    { name: 'San Diego', coords: [-117.1611, 32.7157], color: '#a855f7', isHQ: false },
    { name: 'Los Angeles', coords: [-118.2437, 34.0522], color: '#a855f7', isHQ: false },
    { name: 'Riverside', coords: [-117.3755, 33.9533], color: '#a855f7', isHQ: false },
    { name: 'San Bernardino', coords: [-117.2898, 34.1083], color: '#a855f7', isHQ: false },
    { name: 'Ventura', coords: [-119.2290, 34.2746], color: '#a855f7', isHQ: false },
    { name: 'Kern County', coords: [-118.8297, 35.3333], color: '#a855f7', isHQ: false },
  ];

  const toggleProjection = () => {
    if (!map.current) return;
    const nextIsGlobe = !isGlobe;
    setIsGlobe(nextIsGlobe);
    
    map.current.setProjection({
      type: nextIsGlobe ? 'globe' : 'mercator'
    });

    if (nextIsGlobe) {
      map.current.easeTo({ 
        zoom: 2, 
        center: [-100, 35], 
        duration: 2000 
      });
      startRotation();
    } else {
      stopRotation();
      map.current.easeTo({ 
        zoom: 7, 
        center: [-117.9530, 33.6846], 
        duration: 1500,
        pitch: 0,
        bearing: 0
      });
    }
  };

  const startRotation = () => {
    if (!map.current) return;
    const rotate = () => {
      const center = map.current.getCenter();
      center.lng -= 0.08; // Slower, more majestic rotation
      map.current.setCenter(center);
      rotationRef.current = requestAnimationFrame(rotate);
    };
    rotate();
  };

  const stopRotation = () => {
    if (rotationRef.current) {
      cancelAnimationFrame(rotationRef.current);
    }
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-100, 35], // Start centered for globe
      zoom: 2, // Start zoomed out
      projection: 'globe', // Start in globe mode
      attributionControl: false,
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgba(124, 58, 237, 0.4)',
        'high-color': 'rgba(15, 12, 41, 1)',
        'horizon-blend': 0.1,
        'space-color': 'rgba(5, 5, 20, 1)',
        'star-intensity': 1.0
      });
      
      // Start rotation after style is ready
      startRotation();
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    const existingMarkers = document.querySelectorAll('.custom-marker, .maplibregl-marker');
    existingMarkers.forEach(m => m.remove());

    locations.forEach(loc => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = loc.color;
      el.style.width = loc.isHQ ? '28px' : '16px';
      el.style.height = loc.isHQ ? '28px' : '16px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid rgba(255,255,255,0.8)';
      el.style.boxShadow = `0 0 25px ${loc.color}`;
      el.style.cursor = 'pointer';
      el.style.zIndex = '10';

      if (loc.isHQ) {
        el.style.animation = 'pulse-glow 2s infinite';
      }

      const popup = new maplibregl.Popup({ offset: 25, className: 'premium-popup' })
        .setHTML(`<div style="padding: 14px; font-family: 'Outfit', sans-serif;">
          <strong style="color: #7c3aed; font-size: 15px; display: block; margin-bottom: 4px; font-weight: 800;">${loc.name}</strong>
          <span style="color: #6366f1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
            ${loc.isHQ ? 'Clinical Operations HQ' : 'Regional Priority Care'}
          </span>
        </div>`);

      new maplibregl.Marker({ element: el })
        .setLngLat(loc.coords)
        .setPopup(popup)
        .addTo(map.current);
    });

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes pulse-glow {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 58, 237, 1); }
        70% { transform: scale(1.2); box-shadow: 0 0 0 20px rgba(124, 58, 237, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
      }
      .premium-popup .maplibregl-popup-content {
        border-radius: 24px !important;
        padding: 0 !important;
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(124, 58, 237, 0.2);
        box-shadow: 0 25px 50px -12px rgba(88, 28, 135, 0.25) !important;
      }
      .animate-spin-slow {
        animation: spin 8s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .space-canvas {
        background: radial-gradient(circle at center, #1b1464 0%, #0c0c0c 100%);
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      stopRotation();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

    return (
    <div className="relative w-full h-[720px] rounded-[45px] overflow-hidden border border-purple-200/50 shadow-2xl group space-canvas">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* HUD: Identity Plate */}
      <div className="absolute top-8 left-8 z-10 bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl pointer-events-none transform transition-all duration-700 group-hover:scale-105 group-hover:bg-gray-900/60">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-3 h-3">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md animate-pulse"></div>
            <div className="relative w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Operational Status: Active</span>
        </div>
        <h5 className="text-lg font-black text-white tracking-tight">Southern California Network</h5>
        <div className="flex items-center gap-2 mt-3 p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <Zap size={12} className="text-purple-400 fill-purple-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-purple-200">Huntington Beach Hub</span>
        </div>
      </div>

      {/* Controller: Morph Toggle */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
        <button
          onClick={toggleProjection}
          className="flex items-center gap-4 px-10 py-5 bg-white text-gray-900 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-110 hover:shadow-purple-500/20 active:scale-95 transition-all duration-700 group/btn font-black text-xs uppercase tracking-[0.2em]"
        >
          {!isGlobe ? (
            <>
              <Globe size={20} className="text-purple-600 animate-spin-slow" />
              <span>Explore Global Reach</span>
            </>
          ) : (
            <>
              <MapIcon size={20} className="text-purple-600 group-hover/btn:-rotate-12 transition-transform" />
              <span>Return to local Mission</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest bg-black/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/5">
          {isGlobe ? "Spin the globe to explore" : "Zoom out to morph into 3D"}
        </p>
      </div>

      {/* Glass Overlay Layer */}
      <div className="absolute inset-0 border-[6px] border-white/5 rounded-[45px] pointer-events-none shadow-inner"></div>
    </div>
  );
};

export default InteractiveMap;
