import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock the PullRequestMonitor component
vi.mock('./components/PullRequestMonitor', () => ({
  default: vi.fn(() => <div data-testid="mock-pr-monitor">Mock PR Monitor</div>)
}))

describe('App', () => {
  it('renders GitHub Repository Monitor heading', () => {
    render(<App />)
    expect(screen.getByText('GitHub Repository Monitor')).toBeInTheDocument()
  })

  it('renders count button with initial value', () => {
    render(<App />)
    expect(screen.getByText('count is 0')).toBeInTheDocument()
  })

  it('increments count when button is clicked', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    
    fireEvent.click(button)
    expect(screen.getByText('count is 1')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(screen.getByText('count is 2')).toBeInTheDocument()
  })

  it('renders Vite and React logos', () => {
    render(<App />)
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument()
    expect(screen.getByAltText('React logo')).toBeInTheDocument()
  })

  it('renders repository form fields', () => {
    render(<App />)
    expect(screen.getByLabelText('Repository Owner:')).toBeInTheDocument()
    expect(screen.getByLabelText('Repository Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub Token (optional):')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Monitor Repository' })).toBeInTheDocument()
  })

  it('updates repository when form is submitted', () => {
    render(<App />)
    
    // Get form elements
    const ownerInput = screen.getByLabelText('Repository Owner:')
    const nameInput = screen.getByLabelText('Repository Name:')
    const submitButton = screen.getByRole('button', { name: 'Monitor Repository' })
    
    // Change input values
    fireEvent.change(ownerInput, { target: { value: 'testuser' } })
    fireEvent.change(nameInput, { target: { value: 'test-repo' } })
    
    // Submit the form
    fireEvent.click(submitButton)
    
    // Verify the PullRequestMonitor component is rendered
    expect(screen.getByTestId('mock-pr-monitor')).toBeInTheDocument()
  })
})