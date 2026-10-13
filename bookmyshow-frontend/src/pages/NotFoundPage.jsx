import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Film, Home } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-5">
      <div className="w-20 h-20 rounded-2xl bg-steel/20 border border-steel/30 flex items-center justify-center mx-auto text-aqua">
        <Film className="w-10 h-10 opacity-70" />
      </div>

      <div>
        <span className="text-4xl font-black text-crimson block tracking-wider">
          404
        </span>
        <h1 className="text-2xl font-black text-mint tracking-tight mt-1">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-mint/60 mt-2 leading-relaxed">
          The page or show you are looking for has concluded or does not exist. Explore our active movies and events.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="crimson"
          size="md"
          icon={Home}
          onClick={() => navigate('/')}
        >
          Return to Homepage
        </Button>
      </div>
    </div>
  )
}

