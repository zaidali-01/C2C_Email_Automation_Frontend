'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'

export default function UploadForm() {
  const [fileNumber, setFileNumber] = useState('')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const router = useRouter()

  const formatDate = (iso) => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}-${m}-${y}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = {}

    if (!fileNumber || !['1', '2'].includes(fileNumber)) {
      errors.fileNumber = 'This field is required!'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const formattedDate = startDate ? formatDate(startDate) : ''
    let apiUrl = `https://c2cemailautomation-production.up.railway.app/upload/csv?file_number=${fileNumber}`
    if (formattedDate) {
      apiUrl += `&startDate=${formattedDate}`
    }

    try {
      setLoading(true)
      setError(null)
      const res = await axios.post(apiUrl)
      setResponse(res.data)
    } catch (err) {
      console.error(err)
      setError('Request failed. Please try again.')
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

    const getSuccessFailStats = () => {
      if (!response || !response.message) return { success: 0, failed: 0 }

      const successMatch = response.message.match(/(\d+)\s+emails\s+generated/i)
      const failedMatch = response.message.match(/(\d+)\s+emails\s+failed/i)

      const success = successMatch ? parseInt(successMatch[1], 10) : 0
      const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0

      return { success, failed }
    }

  const { success, failed } = getSuccessFailStats()

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📤 Process CSV by File</h1>

      <section style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>File</label>
            <select
              value={fileNumber}
              onChange={e => {setFileNumber(e.target.value); setFieldErrors({})}}
              style={{
                ...styles.input,
                borderColor: fieldErrors.fileNumber ? 'red' : '#1d53c9'
              }}
            >
              <option value="">Select file</option>
              <option value="1">file1</option>
              <option value="2">file2</option>
            </select>
            {fieldErrors.fileNumber && <span style={styles.validation}>{fieldErrors.fileNumber}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date (optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{...styles.button, backgroundColor:'#666666'}}
            >
              ⬅ Back to Home
            </button>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Processing…' : 'Generate Emails'}
            </button>
          </div>

        </form>
      </section>

      {error && <p style={styles.error}>{error}</p>}

      {response && (
        <section style={styles.results}>
          <h3 style={styles.heading2}>📧 Generated Emails</h3>

          {success > 0 && (
            <div style={styles.resultsHeader}>
            <p style={styles.success}>
              {success} email{success > 1 ? 's' : ''} generated successfully ✅
            </p>
            <button type="button" onClick={() => router.push('/preview')} style={styles.button}>Preview Generated Emails</button>
            </div>
          )}
          {failed > 0 && (
            <p style={styles.failure}>
              {failed} email{failed > 1 ? 's' : ''} failed to generate ❌
            </p>
          )}
        </section>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },

  heading2: {
    margin: 0,
  },

  heading: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  card: {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
  },
  formGrid: {
    display: 'grid',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.4rem',
    fontWeight: 600,
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1.5px solid #1d53c9',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
  },
  validation: {
    color: 'red',
    fontSize: '0.85rem',
    marginTop: '0.3rem',
  },
  buttonRow: {
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  marginTop: '0.5rem',
  },
  button: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
    width: 'fit-content',
    justifySelf: 'center',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  failure: {
    color: 'red',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  results: {
    marginTop: '2.5rem',
  },
  emailCard: {
    background: '#f7f7f7',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
}
