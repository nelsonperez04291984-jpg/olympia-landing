import React from 'react'

// Replace the URL below with your Calendly scheduling link
const CALENDLY_URL = 'https://calendly.com/YOUR_CALENDLY_LINK'

export default function CalendlyEmbed(){
  React.useEffect(()=>{
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div>
      
        href={CALENDLY_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-block bg-white text-olympiaPurple px-5 py-3 rounded-2xl font-semibold shadow-soft"
      <a>Schedule with Us</a>
    </div>
  )
}