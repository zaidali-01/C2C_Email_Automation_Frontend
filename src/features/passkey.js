'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Passkey({ onSuccess }) {
  const [passkey, setPasskey] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('https://c2cemailautomation-production.up.railway.app/verify/passkey', {
        passkey: passkey,
      })

      if (response.status === 200) {
        sessionStorage.setItem('auth', 'true')
        if (onSuccess) onSuccess() 
        else router.push('/')      
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid passkey.')
      } else {
        setError('Something went wrong.')
      }
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.formBox}>
        <input
          type="password"
          value={passkey}
          onChange={(e) => {setPasskey(e.target.value); setError('')}}
          placeholder="Enter passkey"
          style={styles.inputField}
        />
        {error && <p style={styles.errorText}>{error}</p>}
        <button type="submit" style={styles.submitBtn}>
          Submit
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: 'Segoe UI, sans-serif',
  },
  formBox: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '300px',
  },
  inputField: {
    width: '94%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #1d53c9',
    borderRadius: '4px',
    marginBottom: '2px',
  },
  errorText: {
    color: 'red',
    fontSize: '13px',
    marginBottom: '15px',
    transition: 'all 0.3s ease',
  },
  submitBtn: {
    width: '100%',
    padding: '10px',
    fontSize: '15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
}
