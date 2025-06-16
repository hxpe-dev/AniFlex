import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const UsernameForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      navigate(`/user/${username}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="username-form">
      <input
        type="text"
        placeholder="Enter AniList username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit">Generate My Stats</button>
    </form>
  )
}

export default UsernameForm
