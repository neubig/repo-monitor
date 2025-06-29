import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the OpenHands Repo Monitor heading', () => {
    render(<App />)
    expect(screen.getByText('Repo Monitor')).toBeInTheDocument()
    expect(screen.getByText('Monitor Your Repository')).toBeInTheDocument()
  })

  it('renders the OpenHands logo', () => {
    render(<App />)
    expect(screen.getByAltText('OpenHands logo')).toBeInTheDocument()
  })

  it('renders the repository input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Enter repository URL/i)).toBeInTheDocument()
  })

  it('renders the Start Monitoring button initially', () => {
    render(<App />)
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument()
  })

  it('shows monitoring status when Start Monitoring is clicked with a URL', () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Enter repository URL/i)
    const button = screen.getByText('Start Monitoring')
    
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
    fireEvent.click(button)
    
    expect(screen.getByText('Monitoring Active')).toBeInTheDocument()
    expect(screen.getByText('Repository: https://github.com/test/repo')).toBeInTheDocument()
    expect(screen.getByText('Stop Monitoring')).toBeInTheDocument()
  })

  it('does not start monitoring when URL is empty', () => {
    render(<App />)
    const button = screen.getByText('Start Monitoring')
    
    fireEvent.click(button)
    
    expect(screen.queryByText('Monitoring Active')).not.toBeInTheDocument()
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument()
  })

  it('stops monitoring when Stop Monitoring is clicked', () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Enter repository URL/i)
    const startButton = screen.getByText('Start Monitoring')
    
    // Start monitoring
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
    fireEvent.click(startButton)
    
    // Stop monitoring
    const stopButton = screen.getByText('Stop Monitoring')
    fireEvent.click(stopButton)
    
    expect(screen.queryByText('Monitoring Active')).not.toBeInTheDocument()
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<App />)
    expect(screen.getByText('Real-time Updates')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument()
    expect(screen.getByText('Easy Integration')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<App />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('renders footer with OpenHands link', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Powered by OpenHands')
  })
})