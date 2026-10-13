import React from 'react'
import { Modal } from '../common/Modal'
import { CITIES } from '../../data/cities'
import { MapPin, Check, Building2, Landmark, Compass, SunMedium, Castle, TreePine } from 'lucide-react'

const ICON_MAP = {
  Building2,
  Landmark,
  TreePine,
  Castle,
  Compass,
  SunMedium,
}

export function CitySelectorModal({ isOpen, onClose, selectedCity, onSelectCity }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Your City"
      subtitle="Find movies, cinemas, and showtimes near you"
      maxWidth="max-w-xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {CITIES.map((city) => {
          const isSelected = city.name.toLowerCase() === (selectedCity || '').toLowerCase()
          const CityIcon = ICON_MAP[city.icon] || MapPin

          return (
            <button
              key={city.id}
              onClick={() => {
                onSelectCity(city.name)
                onClose()
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 group relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-steel/30 border-aqua text-mint shadow-md ring-1 ring-aqua/50'
                  : 'bg-navy-dark/60 border-steel/20 text-mint/80 hover:bg-steel/20 hover:border-steel/50 hover:text-mint'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-aqua text-navy flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-aqua text-navy'
                      : 'bg-steel/20 text-aqua group-hover:bg-steel/40'
                  }`}
                >
                  <CityIcon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm tracking-tight text-mint">
                  {city.name}
                </h4>
                <p className="text-[11px] text-mint/50 line-clamp-1 mt-0.5">
                  {city.popularAreas.slice(0, 2).join(', ')}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-navy-dark/40 border border-steel/20 text-xs text-mint/60 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-aqua shrink-0" />
        <span>
          Changing your city refreshes cinema hall listings and schedule availability for your area.
        </span>
      </div>
    </Modal>
  )
}

