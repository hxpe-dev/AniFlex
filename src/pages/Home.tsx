import React from 'react'
import './Home.css';
import UsernameForm from '../components/UsernameForm'

const Home: React.FC = () => {
  return (
    <div className="container">
      <img src='/logo-nobg.svg' className='logo'/>
      <h1 className="title">AniFlex</h1>
      <p className="subtitle">Create a stunning summary of your anime journey.</p>
      <UsernameForm />
    </div>
  )
}

export default Home
