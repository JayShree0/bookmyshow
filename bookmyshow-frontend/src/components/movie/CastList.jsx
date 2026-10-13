import React from 'react'
import { ImageWithFallback } from '../common/ImageWithFallback'

export function CastList({ cast = [], director }) {
  if (!cast || cast.length === 0) return null

  return (
    <div className="space-y-4">
      {director && (
        <div className="mb-4 text-xs text-mint/70">
          <span className="text-mint/40 uppercase font-semibold text-[10px] tracking-wider block">
            Director
          </span>
          <span className="font-semibold text-mint text-sm">{director}</span>
        </div>
      )}

      <div>
        <h4 className="text-base font-bold text-mint mb-3">Cast & Crew</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {cast.map((member, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-steel/20 border border-steel/30"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-aqua/40 bg-navy-dark">
                <ImageWithFallback
                  src={member.avatar}
                  alt={member.name}
                  aspectRatio="aspect-square"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h5 className="font-semibold text-xs text-mint truncate">
                  {member.name}
                </h5>
                <p className="text-[11px] text-mint/60 truncate mt-0.5">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

