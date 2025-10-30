import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero3D() {
  return (
    <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <Spline
        scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 text-slate-200">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs md:text-sm opacity-90">Realtime-ready visual — secure automation</span>
      </div>
    </div>
  );
}
