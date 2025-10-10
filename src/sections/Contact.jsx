import React, { useState } from 'react'
import CalendlyEmbed from '../widgets/CalendlyEmbed'

// Uses Formspree. Replace YOUR_FORMSPREE_ID with your form endpoint id (e.g. https://formspree.io/f/mrgrxyz)

export default function Contact(){
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e)=>{
    e.preventDefault()
    const form = e.target
    const data = new FormData(form)
    setStatus('sending')
    try{
      const res = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      if(res.ok){
        setStatus('sent')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch{
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-16 bg-olympiaPurple text-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold">Get in Touch</h2>
          <p className="mt-3 text-purple-100">Have questions or want to learn more about our services? Use the form and our team will respond promptly.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm">Full name</label>
              <input required name="name" className="mt-1 w-full rounded-lg p-3 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm">Email</label>
              <input required type="email" name="email" className="mt-1 w-full rounded-lg p-3 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm">Phone</label>
              <input name="phone" className="mt-1 w-full rounded-lg p-3 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm">Message</label>
              <textarea required name="message" rows="4" className="mt-1 w-full rounded-lg p-3 text-gray-800" />
            </div>

            <div>
              <button type="submit" className="bg-white text-olympiaPurple px-6 py-3 rounded-2xl font-semibold">Send Message</button>
            </div>

            {status === 'sending' && <p>Sending…</p>}
            {status === 'sent' && <p className="text-green-200">Thanks — message sent!</p>}
            {status === 'error' && <p className="text-yellow-200">There was a problem. Try again or email info@olympia.example</p>}
          </form>

        </div>

        <div>
          <h3 className="text-xl font-semibold">Book a Consultation</h3>
          <p className="mt-2 text-purple-100">Select a date/time for an initial assessment — Calendly opens in a small modal or new tab.</p>
          <div className="mt-4">
            <CalendlyEmbed />
          </div>

          <div className="mt-8 text-sm text-purple-200">
            <p>Office: 123 Care Lane, Hometown</p>
            <p>Phone: (555) 555-5555</p>
            <p>Email: info@olympia.example</p>
          </div>
        </div>
      </div>
    </section>
  )
}