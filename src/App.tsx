import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PullRequestMonitor from './components/PullRequestMonitor'
import { Repository } from './services/PullRequestService'

function App() {
  const [count, setCount] = useState(0)
  const [repository, setRepository] = useState<Repository>({ owner: 'neubig', name: 'repo-monitor' })
  const [owner, setOwner] = useState('neubig')
  const [name, setName] = useState('repo-monitor')
  const [token, setToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRepository({ owner, name })
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>GitHub Repository Monitor</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="owner">Repository Owner:</label>
            <input 
              type="text" 
              id="owner" 
              value={owner} 
              onChange={(e) => setOwner(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Repository Name:</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="token">GitHub Token (optional):</label>
            <input 
              type="password" 
              id="token" 
              value={token} 
              onChange={(e) => setToken(e.target.value)}
              placeholder="For private repositories"
            />
          </div>
          
          <button type="submit">Monitor Repository</button>
        </form>
      </div>
      
      <div className="monitor-container">
        <PullRequestMonitor repository={repository} githubToken={token || undefined} />
      </div>
      
      <div className="card counter-card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
