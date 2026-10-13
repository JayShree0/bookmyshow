import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { AuthModal } from '../components/layout/AuthModal'
import { AuthPage } from '../pages/AuthPage'
import { Modal } from '../components/common/Modal'

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthModal & Signup Flow', () => {
  it('renders Modal with header and proper max-h container', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal" subtitle="Test Subtitle">
        <p>Modal Content</p>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()

    const closeBtn = screen.getByLabelText(/close dialog/i)
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it('renders AuthModal in Sign Up tab and displays all required fields', () => {
    renderWithProviders(
      <AuthModal isOpen={true} onClose={() => {}} initialTab="signup" />
    )

    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\. Rohan Sharma/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/your\.email@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/9876543210/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Demo Account/i })).toBeInTheDocument()
  })

  it('validates required fields on signup submit and shows field error messages', () => {
    renderWithProviders(
      <AuthModal isOpen={true} onClose={() => {}} initialTab="signup" />
    )

    const submitBtn = screen.getByRole('button', { name: /Create Demo Account/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/Email address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Mobile number is required/i)).toBeInTheDocument()
  })

  it('validates password mismatch on signup', () => {
    renderWithProviders(
      <AuthModal isOpen={true} onClose={() => {}} initialTab="signup" />
    )

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Rohan Sharma/i), {
      target: { value: 'Aarav Kumar' },
    })
    fireEvent.change(screen.getByPlaceholderText(/your\.email@example\.com/i), {
      target: { value: 'aarav@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/9876543210/i), {
      target: { value: '9876543210' },
    })

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'mismatched123' } })

    const submitBtn = screen.getByRole('button', { name: /Create Demo Account/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
  })

  it('toggles password visibility with Eye and EyeOff icons', () => {
    renderWithProviders(
      <AuthModal isOpen={true} onClose={() => {}} initialTab="signup" />
    )

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
    expect(passwordInputs[0]).toHaveAttribute('type', 'password')

    const toggleBtns = screen.getAllByLabelText(/Show password/i)
    fireEvent.click(toggleBtns[0])

    expect(passwordInputs[0]).toHaveAttribute('type', 'text')
  })

  it('switches between Sign In and Sign Up tabs cleanly', () => {
    renderWithProviders(
      <AuthModal isOpen={true} onClose={() => {}} initialTab="signin" />
    )

    expect(screen.getByText(/Sign in to BookMyShow/i)).toBeInTheDocument()
    expect(screen.getByText(/Instant Demo Logins/i)).toBeInTheDocument()

    const signUpTabButtons = screen.getAllByRole('button', { name: /^Sign Up$/i })
    fireEvent.click(signUpTabButtons[0])

    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument()
    // Demo logins should be hidden in signup to keep height compact
    expect(screen.queryByText(/Instant Demo Logins/i)).not.toBeInTheDocument()
  })

  it('renders standalone AuthPage in Sign Up mode', () => {
    renderWithProviders(<AuthPage initialTab="signup" />)

    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Demo Account/i })).toBeInTheDocument()
    expect(screen.getByText(/Back to Movies/i)).toBeInTheDocument()
  })
})
