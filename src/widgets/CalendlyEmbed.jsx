import React, { useEffect } from 'react';

// The full data-url from Calendly, including any styling parameters
const CALENDLY_DATA_URL = 'https://calendly.com/nelsonperez04291984?primary_color=a96cd1';

export default function CalendlyEmbed() {
  // Use useEffect to load the Calendly widget script
  useEffect(() => {
    // Check if the script is already loaded to avoid adding it multiple times
    if (document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    
    // Append the script to the body. Using document.head is also common.
    document.body.appendChild(script);

    // Clean up the script when the component unmounts (optional but good practice)
    // return () => {
    //   document.body.removeChild(script);
    // };
  }, []); // Empty dependency array means this runs once after the initial render

  return (
    <div style={{ padding: '20px' }}>
      {/* This is the JSX equivalent of the HTML widget div.
        - className is used instead of class.
        - The data-url attribute is used exactly as provided by Calendly.
      */}
      <div 
        className="calendly-inline-widget" 
        data-url={CALENDLY_DATA_URL} 
        style={{ minWidth: '320px', height: '700px' }}
      >
        {/* Optional: Add a loading state or text here */}
        <p>Loading booking calendar...</p>
      </div>
    </div>
  );
}