// src/app/layout.js

import '../styles/globals.css'

export const metadata = {
  title: 'C2C Email Automation',
  description: 'Upload CSV, generate emails, and view logs',
}

export default function RootLayout({ children }) 
{
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
