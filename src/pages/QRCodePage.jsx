import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'

const SITE_URL = 'https://olympia-landing.vercel.app/'

const QRCodePage = () => {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 1024
    canvas.width = size
    canvas.height = size

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)

      const link = document.createElement('a')
      link.download = 'olympia-home-health-qr.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = url
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6 print:bg-white print:from-white print:via-white print:to-white">
      <div className="max-w-lg w-full">
        {/* Back button - hidden when printing */}
        <div className="print:hidden mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* QR Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center print:shadow-none print:rounded-none">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center justify-center mb-4">
            <img
              src="/logo-qr-trimmed.png"
              alt="Olympia Home Health Logo"
              className="w-28 h-auto object-contain mb-2"
            />
          </div>

          {/* QR Code */}
          <div className="inline-block p-6 bg-white rounded-2xl border-2 border-gray-100 mb-6">
            <QRCodeSVG
              id="qr-code-svg"
              value={SITE_URL}
              size={256}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              imageSettings={{
                src: '/logo-qr-trimmed.png',
                x: undefined,
                y: undefined,
                height: 56,
                width: 48,
                excavate: true,
              }}
            />
          </div>

          {/* URL Display */}
          <p className="text-gray-600 text-sm mb-2">Scan to visit our website</p>
          <p className="text-purple-600 font-mono text-xs bg-purple-50 inline-block px-4 py-2 rounded-full mb-8">
            {SITE_URL}
          </p>

          {/* Action Buttons - hidden when printing */}
          <div className="flex gap-3 justify-center print:hidden">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all hover:scale-105 shadow-lg shadow-purple-200"
            >
              <Download size={18} />
              Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all hover:scale-105"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>

        {/* Contact info below card */}
        <div className="text-center mt-6 text-purple-200 text-sm print:text-gray-600">
          <p>2044 Beach Blvd, Suite 320, Huntington Beach, CA 92648</p>
          <p>Phone: (657) 377-0776</p>
        </div>
      </div>
    </div>
  )
}

export default QRCodePage
