'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function PreviewEmails() 
{
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [editedBody, setEditedBody] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedFileNumber, setSelectedFileNumber] = useState('1')

  const router = useRouter()

  const fetchEmails = async () => {
    try {
      const res = await axios.get(`https://c2cemailautomation-production.up.railway.app/preview/temp-emails?file_num=${selectedFileNumber}`)
      setEmails(res.data.emails)
      setMessage(res.data.message)
    } catch (err) {
      setError('Failed to fetch emails.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [selectedFileNumber])


  const handleRegenerate = async (id) => {
    const confirmed = confirm("Do you want to regenerate this email?")
    if (!confirmed) return

    try {
      const res = await axios.put(`https://c2cemailautomation-production.up.railway.app/regenerate/body/${id}`)

      if (selectedEmail?.id === id) {
        setSelectedEmail(prev => ({
          ...prev,
          subject: res?.data?.subject,
          generated_email: res?.data?.body
        }))
      }

      await fetchEmails()

    } catch (err) {
      console.error("Regenerate failed", err)
      alert("Failed to regenerate email.")
    }
  }

  const handleFileNumberChange = (e) => {
    setSelectedFileNumber(e.target.value)
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`https://c2cemailautomation-production.up.railway.app/update/temp-emails/${selectedEmail.id}`, {
        updated_body: editedBody,
      })
      await fetchEmails()
      setSelectedEmail(prev => ({
        ...prev,
        generated_email: editedBody,
      }))
      setEditedBody('')
      setIsEditing(false)
    } catch (err) {
      alert('Update failed')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this email?')) return
    try {
      await axios.delete(`https://c2cemailautomation-production.up.railway.app/remove/${id}`)
      await fetchEmails()
      setSelectedEmail(null)
    } catch (err) {
      alert('Delete failed')
      console.error(err)
    }
  }

  const handleSendAll = async () => {
    if (emails.length==0)
    {
      alert('No emails to be sent')
      return
    }
    try {
      setSending(true)
      const res = await axios.post(`https://c2cemailautomation-production.up.railway.app/send/send-emails?file_num=${selectedFileNumber}`)
      alert(res.data.message || 'All emails sent successfully.')
      await fetchEmails()
    } 
    catch (err) {
      console.error(err)
      alert('Failed to send all emails.')
    }
    finally {
      setSending(false)
    }
  }
  if (selectedEmail) {
    return (
      <div style={styles.container}>
        <button onClick={() => {
          setSelectedEmail(null)
          setIsEditing(false)
        }} style={styles.previewBackButton}>
          ⬅ Back
        </button>
        <div style={styles.previewCard}>
          <div style={styles.previewTopBar}>
            <div></div>
            <div style={styles.previewActions}>
              <span
                style={styles.icon}
                title="Regenerate"
                onClick={() => handleRegenerate(selectedEmail.id)} 
              >🔄</span>
              <span
                style={styles.icon}
                title="Edit"
                onClick={() => {
                  setIsEditing(true)
                  setEditedBody(selectedEmail.generated_email)
                }}
              >✏️</span>
              <span
                style={styles.icon}
                title="Remove"
                onClick={() => handleDelete(selectedEmail.id)}
              >🗑️</span>
            </div>
          </div>
          <p><strong>From:</strong> {selectedEmail.sender_email}</p>
          <p><strong>To:</strong> {selectedEmail.recipient_email}</p>
          <p><strong>Date:</strong> {selectedEmail.created_at.split('-').reverse().join('-')}</p>
          <p><strong>Subject:</strong> {selectedEmail.subject}</p>
          <p><strong>Body:</strong></p>
          {isEditing ? (
            <>
              <textarea
                style={styles.emailTextarea}
                rows={10}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
              />
              <div style={styles.buttonRow}>
                <button style={styles.updateButton} onClick={handleUpdate}>Update</button>
                <button
                  style={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false)
                    setEditedBody('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p style={styles.emailBody}>{selectedEmail.generated_email}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button
          type="button"
          onClick={() => router.push('/')}
          style={styles.backButton}
        >
          ⬅ Back to Home
        </button>
        <div style={styles.headingRow}>
          <h1 style={styles.heading}>📩 Preview Generated Emails</h1>
          <select 
            value={selectedFileNumber} 
            onChange={handleFileNumberChange} 
            style={styles.dropdown}
          >
            <option value='1'>File 1</option>
            <option value='2'>File 2</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSendAll}
          style={styles.sendAllButton}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send All'}
        </button>
      </div>

      {loading && <p style={styles.noEmails}>Loading emails...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && emails.length === 0 && (
        <>
          <p style={styles.noEmails}>{message}</p>
          <button
            type="button"
            onClick={() => router.push('/logs')}
            style={styles.logsButton}
          >
            View Logs
          </button>
        </>
      )}

      <div style={styles.chatList}>
        {emails.map((email, index) => (
          <div key={index} style={styles.chatBubble}>
            <div style={styles.emailRow}>
              <div style={styles.emailInfo}>
                <p><strong>From:</strong> {email.sender_email}</p>
                <p><strong>To:</strong> {email.recipient_email}</p>
                <p><strong>Subject:</strong> {email.subject}</p>
                <p><strong>Date:</strong> {email.created_at.split('-').reverse().join('-')}</p>
              </div>
              <div style={styles.actions}>
                <span
                  style={styles.icon}
                  title="Preview"
                  onClick={() => {
                    setSelectedEmail(email)
                    setIsEditing(false)
                  }}
                >🔍</span>
                <span
                  style={styles.icon}
                  title="Edit"
                  onClick={() => {
                    setSelectedEmail(email)
                    setIsEditing(true)
                    setEditedBody(email.generated_email)
                  }}
                >✏️</span>
                <span
                  style={styles.icon}
                  title="Remove"
                  onClick={() => handleDelete(email.id)}
                >🗑️</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  backButton: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#666666',
    color: '#fff',
    cursor: 'pointer',
    marginBottom: '0.5rem',
  },
  logsButton: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#1d53c9',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '0.5rem',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  sendAllButton: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#1d53c9',
    color: '#fff',
    cursor: 'pointer',
    marginBottom: '0.5rem',
  },
  previewBackButton: {
    marginBottom: '1.5rem',
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#666666',
    color: '#fff',
    cursor: 'pointer',
  },
  heading: {
    fontSize: '1.8rem',
    margin: 0,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '1rem',
  },
  noEmails: {
    color: '#666',
    textAlign: 'center',
    marginTop: '13rem',
  },
  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  chatBubble: {
    background: '#ffffff',
    padding: '1rem',
    border: '1.5px solid #1d53c9',
    borderRadius: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  emailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailInfo: {
    flex: 1,
    marginLeft: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginLeft: '1rem',
  },
  icon: {
    fontSize: '1.4rem',
    cursor: 'pointer',
    marginRight: '1rem',
  },
  previewCard: {
    backgroundColor: '#f7f7f7',
    padding: '2rem',
    borderRadius: '12px',
    border: '2px solid #1d53c9',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  previewTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  previewActions: {
    display: 'flex',
    gap: '1rem',
  },
  emailBody: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    whiteSpace: 'pre-wrap',
    border: '1px solid #ccc',
  },
  emailTextarea: {
    width: '97%',
    fontSize: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginTop: '1rem',
    fontFamily: 'inherit',
  },
  updateButton: {
    marginTop: '1rem',
    padding: '0.6rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    backgroundColor: '#1d53c9',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  cancelButton: {
    marginTop: '1rem',
    padding: '0.6rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    backgroundColor: '#666666',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  headingWithDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  dropdown: {
    padding: '6px 10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #1d53c9',
    marginLeft: '7vw',
    marginRight: '2vw',
  },
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10vw',
  },
}
