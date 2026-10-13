import React from 'react'
import { Modal } from './Modal'
import { Play, Film } from 'lucide-react'

export function TrailerModal({ isOpen, onClose, movie }) {
  if (!movie) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${movie.title} — Official Trailer`}
      subtitle="Demo Trailer Preview"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-navy-dark border border-steel/30 flex items-center justify-center">
          {movie.trailerUrl ? (
            <iframe
              src={`${movie.trailerUrl}?autoplay=1`}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8">
              <Film className="w-16 h-16 text-aqua mx-auto mb-3 opacity-60" />
              <h4 className="text-lg font-semibold text-mint">{movie.title}</h4>
              <p className="text-sm text-mint/60 mt-1 max-w-md">
                Official trailer playback preview (Simulated high-definition trailer stream).
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson/20 border border-crimson/40 text-xs font-semibold text-mint">
                <Play className="w-3.5 h-3.5 fill-current" /> Demo Cinematic Preview
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-mint/60 pt-2 border-t border-steel/20">
          <span>Certification: <strong className="text-mint">{movie.certification}</strong></span>
          <span>Duration: <strong className="text-mint">{movie.duration}</strong></span>
          <span>Formats: <strong className="text-mint">{movie.formats?.join(', ')}</strong></span>
        </div>
      </div>
    </Modal>
  )
}

