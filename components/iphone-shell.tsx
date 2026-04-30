"use client"

import type { ReactNode } from "react"

export function IPhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="relative w-[390px] h-[844px] rounded-[55px] bg-black p-[14px] shadow-2xl shadow-black/50">
        {/* Outer bezel */}
        <div className="absolute inset-0 rounded-[55px] border border-slate-600/30" />
        
        {/* Screen */}
        <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-background">
          {/* Dynamic Island */}
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-3">
            <div className="w-[126px] h-[37px] bg-black rounded-full" />
          </div>
          
          {/* Content */}
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </div>
        
        {/* Side buttons */}
        <div className="absolute left-[-3px] top-[160px] w-[3px] h-[32px] bg-slate-700 rounded-l-sm" />
        <div className="absolute left-[-3px] top-[220px] w-[3px] h-[64px] bg-slate-700 rounded-l-sm" />
        <div className="absolute left-[-3px] top-[296px] w-[3px] h-[64px] bg-slate-700 rounded-l-sm" />
        <div className="absolute right-[-3px] top-[240px] w-[3px] h-[80px] bg-slate-700 rounded-r-sm" />
      </div>
    </div>
  )
}
