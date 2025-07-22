'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'

export default function Logs() {
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const [selectedDeveloper, setSelectedDeveloper] = useState(null)
  const [emails, setEmails] = useState([])
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFileNum, setSelectedFileNum] = useState('1')

  const router = useRouter()

  useEffect(() => {
    fetchLogs()
  }, [selectedFileNum])


  const fetchLogs = async (query = '') => {
    try {
      const url = query
        ? `https://c2cemailautomation-production.up.railway.app/sent/logs?name=${encodeURIComponent(query)}&file_num=${selectedFileNum}`
        : `https://c2cemailautomation-production.up.railway.app/sent/logs?file_num=${selectedFileNum}`
        
      const res = await axios.get(url)
      setDevelopers(res?.data?.developers || [])
      setMessage(res?.data?.message)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch developer logs.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    fetchLogs(query, selectedFileNum)
  }

  const handleViewEmails = async (developer, date = '', page = 1) => {
    setSelectedDeveloper(developer)
    setEmailLoading(true)
    setEmailError(null)

    const limit = 10
    const offset = (page - 1) * limit

    try {
      let url = `https://c2cemailautomation-production.up.railway.app/developer/developer-emails?name=${developer.name}&email=${developer.email}&limit=${limit}&offset=${offset}`
      if (date) {
        url += `&date=${date}`
      }
      url += `&file_num=${selectedFileNum}`
      const res = await axios.get(url)
      setEmails(res.data?.emails || [])
      setCurrentPage(page)
    } catch (err) {
      console.error(err)
      setEmailError('Failed to fetch emails.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleBackToDevelopers = () => {
    setSelectedDeveloper(null)
    setEmails([])
    setSelectedEmail(null)
  }

  const handleBackToEmails = () => {
    setSelectedEmail(null)
  }

  return (
    <div style={styles.container}>
      {!selectedDeveloper && (
        <>
          <div style={styles.headerContainer}>
            <button onClick={() => router.push('/')} style={styles.backButton}>
              ⬅ Back to Home
            </button>

            <h1 style={styles.heading}>👨‍💻 Emails Sent by Developers</h1>

            <select
              value={selectedFileNum}
              onChange={(e) => {
                const value = e.target.value
                setSelectedFileNum(value)
                fetchLogs(searchQuery)
              }}
              style={styles.fileDropdown}
            >
              <option value="1">file1</option>
              <option value="2">file2</option>
            </select>
          </div>
          <input
              type="text"
              placeholder="Search by developer name..."
              value={searchQuery}
              onChange={handleSearch}
              style={styles.searchInput}
            />
          {loading && <p style={styles.info}>Loading logs...</p>}
          {error && <p style={styles.error}>{error}</p>}

          {!loading && developers.length === 0 && (
            <p style={styles.info}>{message || 'No logs found.'}</p>
          )}

          <div style={styles.list}>
            {developers.map((dev, index) => (
              <div key={index} style={styles.card}>
                <div style={styles.devContent}>
                  <div>
                    <p><strong>Name:</strong> {dev.name}</p>
                    <p><strong>Email:</strong> {dev.email}</p>
                  </div>
                  <button style={styles.viewBtn} onClick={() => handleViewEmails(dev)}>
                    View Emails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedDeveloper && !selectedEmail && (
        <>
          <div style={styles.headerWithDate}>
            <button style={styles.backBtn} onClick={handleBackToDevelopers}>
              Back
            </button>
            <h1 style={styles.headingCentered}>Emails sent by {selectedDeveloper.name}</h1>
            <div style={styles.dateFilterContainer}>
              <label htmlFor="filterDate" style={styles.dateLabel}>Filter by Date:</label>
              <DatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) => {
                  const formatted = format(date, 'yyyy-MM-dd')
                  setSelectedDate(formatted)
                  handleViewEmails(selectedDeveloper, formatted)
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="customDateInput"
              />
            </div>
          </div>
          <div style={styles.list}>
            {emailLoading && <p style={styles.info}>Loading emails...</p>}
            {emailError && <p style={styles.error}>{emailError}</p>}
            {!emailLoading && emails.length === 0 && (
              <p style={styles.info}>No emails sent by this developer.</p>
            )}
            {emails.map((email, idx) => (
              <div key={idx} style={styles.emailCard}>
                <div style={styles.emailRow}>
                  <div>
                    <p><strong>To:</strong> {email.recipient_email}</p>
                    <p><strong>Subject:</strong> {email.subject}</p>
                    <p><strong>Date:</strong> {email.sent_at.split('-').reverse().join('-')}</p>
                  </div>
                  <button style={styles.expandBtn} onClick={() => setSelectedEmail(email)}>
                    Expand Email
                  </button>
                </div>
              </div>
            ))}{ emails.length!=0 && 
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => handleViewEmails(selectedDeveloper, selectedDate, currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                Previous
              </button>
              <span style={{marginTop:'15px'}}><strong>Page {currentPage}</strong></span>
              <button
                onClick={() => handleViewEmails(selectedDeveloper, selectedDate, currentPage + 1)}
                disabled={emails.length < 10}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                Next
              </button>
            </div>}
          </div>
        </>
      )}

      {selectedEmail && (
        <div style={styles.previewContainer}>
          <button
            style={styles.previewBackButton}
            onClick={handleBackToEmails}
          >
          Back
          </button>
          <div style={styles.previewCard}>
            <p><strong>From:</strong> {selectedDeveloper.email}</p>
            <p><strong>To:</strong> {selectedEmail.recipient_email}</p>
            <p><strong>Subject:</strong> {selectedEmail.subject}</p>
            <p><strong>Date:</strong> {selectedEmail.sent_at.split('-').reverse().join('-')}</p>
            <p><strong>Body:</strong></p>
            <p style={styles.emailBody}>{selectedEmail.body}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '2rem',
  },
  heading: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  info: {
    textAlign: 'center',
    color: '#666',
    marginTop: '10rem',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '2rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #1d53c9',
    padding: '1.2rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  emailCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #1d53c9',
    padding: '1rem',
    borderRadius: '8px',
  },
  emailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    position: 'relative',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  backBtn: {
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#666666',
    color: '#fff',
    cursor: 'pointer',
    marginRight: '10px',
  },
  backButton: {
    flex: '0 0 auto',
    padding: '0.7rem 1rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#666666',
    color: '#fff',
    cursor: 'pointer',
    marginRight: '10px',
  },
  viewBtn: {
    marginTop: '1rem',
    fontWeight: 'bold',
    backgroundColor: '#1d53c9',
    color: '#fff',
    padding: '0.5rem 0.7rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  expandBtn: {
    backgroundColor: '#1d53c9',
    fontWeight: '600',
    color: '#fff',
    padding: '0.5rem 0.7rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    height: 'fit-content',
  },
  devContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewContainer: {
    marginTop: '2rem',
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
  previewCard: {
    backgroundColor: '#f7f7f7',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #1d53c9',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  emailBody: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    whiteSpace: 'pre-wrap',
    border: '1px solid #ccc',
  },
  searchInput: {
    width: '98%',
    padding: '0.7rem',
    margin: '1rem 0',
    borderRadius: '6px',
    border: '1px solid #1d53c9',
    fontSize: '1rem',
    fontWeight: '500',
  },
  headerWithDate: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', 
    marginBottom: '2rem',
    gap: '1rem',
    position: 'relative',
  },
  dateFilter: {
    padding: '0.6rem',
    border: '1px solid #1d53c9',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  dateFilterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  headingCentered: {
    flex: '1 1 auto',
    textAlign: 'center',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  dateLabel: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  headingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  fileDropdown: {
    flex: '0 0 auto',
    padding: '0.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    border: '1px solid #1d53c9',
    borderRadius: '6px',
  },
  headerContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0rem',
    borderBottom: '1px solid #ddd',
  },

}
