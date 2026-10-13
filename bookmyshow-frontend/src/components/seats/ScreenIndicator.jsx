import React from 'react'

export function ScreenIndicator() {
  return (
    <div className="w-full flex flex-col items-center my-6 select-none">
      {/* Curved glowing screen bar */}
      <div className="relative w-3/4 max-w-lg h-3 rounded-t-full bg-gradient-to-r from-aqua/20 via-aqua to-aqua/20 shadow-lg shadow-aqua/30 cinema-screen-curve" />
      <div className="w-full h-8 bg-gradient-to-b from-aqua/10 to-transparent pointer-events-none" />

      <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-aqua/80 mt-1">
        All Eyes This Way
      </span>
      <span className="text-[9px] text-mint/40 uppercase tracking-widest mt-0.5">
        Screen
      </span>
    </div>
  )
}

