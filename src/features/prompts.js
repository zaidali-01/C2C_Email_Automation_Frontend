'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function PreviewPrompts() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newPromptEmail, setNewPromptEmail] = useState('')
  const [newPromptText, setNewPromptText] = useState('')

  const router = useRouter()

  const fetchPrompts = async () => {
    try {
      const res = await axios.get('https://c2cemailautomation-production.up.railway.app/get/prompts')
      setPrompts(res.data || [])
    } catch (err) {
      setError('Failed to fetch prompts.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  const handleUpdate = async () => {
    try {
      await axios.put(`https://c2cemailautomation-production.up.railway.app/edit/prompt/${selectedPrompt.id}`, { updated_prompt: editedPrompt })
      setSelectedPrompt(prev => ({ ...prev, prompt: editedPrompt }))
      setIsEditing(false)
      setEditedPrompt('')
      await fetchPrompts()
    } catch (err) {
      alert('Update failed.')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return
    try {
      await axios.delete(`https://c2cemailautomation-production.up.railway.app/delete/prompt/${id}`)
      setSelectedPrompt(null)
      await fetchPrompts()
    } catch (err) {
      alert('Delete failed.')
      console.error(err)
    }
  }

  const handleAdd = async () => {
    if (!newPromptEmail || !newPromptText) return alert("Fill in both fields.")
    try {
      await axios.post(`https://c2cemailautomation-production.up.railway.app/add/prompt`, {
        email: newPromptEmail,
        prompt: newPromptText
      })
      setNewPromptEmail('')
      setNewPromptText('')
      setIsAdding(false)
      await fetchPrompts()
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert('A prompt with this email already exists!')
      } else {
        alert('Add failed!')
      }
      console.error(err)
    }
  }

  if (isAdding) {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h1 style={styles.heading}>➕ Add New Prompt</h1>
        </div>
        <div style={styles.previewCard}>
          <input
            placeholder="Email"
            style={styles.emailTextarea}
            value={newPromptEmail}
            onChange={(e) => setNewPromptEmail(e.target.value)}
          />
          <textarea
            placeholder="Prompt"
            style={styles.emailTextarea}
            rows={8}
            value={newPromptText}
            onChange={(e) => setNewPromptText(e.target.value)}
          />
          <div style={styles.buttonRow}>
            <button style={styles.updateButton} onClick={handleAdd}>Add</button>
            <button style={styles.cancelButton} onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedPrompt) {
    return (
      <div style={styles.container}>
        <button onClick={() => {
          setSelectedPrompt(null)
          setIsEditing(false)
        }} style={styles.previewBackButton}>
          ⬅ Back
        </button>

        <div style={styles.previewCard}>
          <div style={styles.previewHeaderRow}>
            <p><strong>Email:</strong> {selectedPrompt.email}</p>
            {!isEditing && (
              <div style={styles.previewActionsRow}>
                <span style={styles.icon} onClick={() => {
                  setIsEditing(true)
                  setEditedPrompt(selectedPrompt.prompt)
                }}>✏️</span>
                <span style={styles.icon} onClick={() => handleDelete(selectedPrompt.id)}>🗑️</span>
              </div>
            )}
          </div>

          <p><strong>Prompt:</strong></p>
          {isEditing ? (
            <>
              <textarea
                style={styles.emailTextarea}
                rows={8}
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
              />
              <div style={styles.buttonRow}>
                <button style={styles.updateButton} onClick={handleUpdate}>Update</button>
                <button
                  style={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false)
                    setEditedPrompt('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p style={styles.emailBody}>{selectedPrompt.prompt}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <button onClick={() => router.push('/')} style={styles.backButton}>⬅ Back to Home</button>
        <h1 style={styles.heading}>🧠 Email Prompts</h1>
        <button onClick={() => setIsAdding(true)} style={styles.addButton}>+ Add</button>
      </div>

      {loading && <></>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && prompts.length === 0 && <p style={{color: '#666', textAlign: 'center', marginTop: '13rem',}}>No prompts found.</p>}
      <div style={styles.chatList}>
        {prompts.map((item, idx) => (
          <div key={idx} style={styles.chatBubble}>
            <div style={styles.emailRow}>
              <div style={styles.emailInfo}>
                <p><strong>Email:</strong> {item.email}</p>
              </div>
              <div style={styles.actions}>
                <span style={styles.icon} title="Preview" onClick={() => {
                  setSelectedPrompt(item)
                  setIsEditing(false)
                }}>🔍</span>
                <span style={styles.icon} title="Edit" onClick={() => {
                  setSelectedPrompt(item)
                  setEditedPrompt(item.prompt)
                  setIsEditing(true)
                }}>✏️</span>
                <span style={styles.icon} title="Remove" onClick={() => handleDelete(item.id)}>🗑️</span>
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
    maxWidth: '90%',
    margin: '0 auto',
    padding: '2rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  backButton: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    backgroundColor: '#666666',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  addButton: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    backgroundColor: '#1d53c9',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  heading: {
    fontSize: '1.8rem',
    textAlign: 'center',
    flex: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '1rem',
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
  },
  emailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emailInfo: {
    flex: 1,
    marginRight: '1rem',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap', 
    gap: '0.5rem',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '1%',
  },
  icon: {
    fontSize: '1.5rem',
    cursor: 'pointer',
    minWidth: '2.5rem',       
    textAlign: 'center',
    padding: '0.3rem 0.5rem',  
  },
  previewBackButton: {
    marginBottom: '1.5rem',
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    backgroundColor: '#666666',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  previewCard: {
    backgroundColor: '#f7f7f7',
    padding: '2rem',
    borderRadius: '12px',
    border: '2px solid #1d53c9',
  },
  previewActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginLeft: '1rem',
  },
  emailBody: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    border: '1px solid #1d53c9',
  },
  emailTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #1d53c9',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  updateButton: {
    padding: '0.6rem 1rem',
    fontWeight: 'bold',
    backgroundColor: '#1d53c9',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.6rem 1rem',
    fontWeight: 'bold',
    backgroundColor: '#666666',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  previewHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewActionsRow: {
    display: 'flex',
    gap: '1rem',
  },
}
