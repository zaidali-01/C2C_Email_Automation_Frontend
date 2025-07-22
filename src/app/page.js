'use client'
import Link from 'next/link'
import '../styles/home.css'

export default function HomePage() 
{
  return (
    <main className="home-container">
      <h1 className="home-title">📬 Email Automation Dashboard</h1>
      <p className="home-subtitle">Streamline outreach using smart, personalized emails powered by AI.</p>

      <div className="nav-buttons">
        <Link href="/upload">
          <button className="nav-button">📤 Process CSV</button>
        </Link>
        <Link href="/preview">
          <button className="nav-button">📝 Preview Emails</button>
        </Link>
        <Link href="/logs">
          <button className="nav-button">📊 Email Logs</button>
        </Link>
      </div>

      <section className="about-section">
        <h2>About Us</h2>
        <p>
          This platform simplifies personalized job application outreach through automated emails configuration.
        </p>
        <p>
            Easily process your data in csv file, generate personalized emails tailored to each opportunity, preview and edit before sending, and manage your communication history — all in one seamless experience. The csv and resumes are available on Google Drive.
        </p>
        <h4>CSV Formating:</h4>
        <div>
            The csv must contain atleast these eight fields with exactly same column headings.<br></br><pre>Date     Profile     Developer Email     Job title     Company     Client Name     Client Email     Job Description</pre>
        </div>
      </section>
    </main>
  )
}
