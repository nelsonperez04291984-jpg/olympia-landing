import React from 'react'

export default function Footer(){
  return (
    <footer className="py-8 text-center text-sm text-gray-600 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        © {new Date().getFullYear()} Olympia Home Health Inc. — All rights reserved.
      </div>
    </footer>
  )
}