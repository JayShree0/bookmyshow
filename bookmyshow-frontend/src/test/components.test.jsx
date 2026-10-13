import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { ScreenIndicator } from '../components/seats/ScreenIndicator'
import { SeatLegend } from '../components/seats/SeatLegend'
import { BookingTimer } from '../components/checkout/BookingTimer'
import { EmptyState } from '../components/common/EmptyState'

describe('Reusable UI Components', () => {
  it('renders Button with variants and handles click events', () => {
    const handleClick = vi.fn()
    render(
      <Button variant="crimson" onClick={handleClick}>
        Book Tickets
      </Button>
    )

    const button = screen.getByRole('button', { name: /Book Tickets/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders Badge with correct label', () => {
    render(<Badge variant="aqua">IMAX 3D</Badge>)
    expect(screen.getByText('IMAX 3D')).toBeInTheDocument()
  })

  it('renders ScreenIndicator with ALL EYES THIS WAY text', () => {
    render(<ScreenIndicator />)
    expect(screen.getByText(/ALL EYES THIS WAY/i)).toBeInTheDocument()
  })

  it('renders SeatLegend with Available, Selected, and Occupied indicators', () => {
    render(<SeatLegend />)
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Selected')).toBeInTheDocument()
    expect(screen.getByText('Occupied')).toBeInTheDocument()
    expect(screen.getByText(/VIP Recliner/i)).toBeInTheDocument()
  })

  it('renders BookingTimer with remaining countdown', () => {
    render(<BookingTimer secondsRemaining={582} isExpired={false} />)
    expect(screen.getByText('09:42')).toBeInTheDocument()
    expect(screen.getByText(/Demo Seat Hold Active/i)).toBeInTheDocument()
  })

  it('renders BookingTimer expired state when expired', () => {
    const handleRestart = vi.fn()
    render(<BookingTimer secondsRemaining={0} isExpired={true} onRestart={handleRestart} />)
    expect(screen.getByText(/Demo Seat Hold Expired/i)).toBeInTheDocument()
    const restartBtn = screen.getByRole('button', { name: /Restart Hold/i })
    fireEvent.click(restartBtn)
    expect(handleRestart).toHaveBeenCalledTimes(1)
  })

  it('renders EmptyState with custom title and action button', () => {
    const handleAction = vi.fn()
    render(
      <EmptyState
        title="No results found"
        description="Try searching with other keywords."
        actionLabel="Clear Search"
        onAction={handleAction}
      />
    )
    expect(screen.getByText('No results found')).toBeInTheDocument()
    const actionBtn = screen.getByRole('button', { name: /Clear Search/i })
    fireEvent.click(actionBtn)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })
})

