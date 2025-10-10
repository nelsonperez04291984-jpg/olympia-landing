import React from 'react'

const ChatWidget = () => {
  React.useEffect(() => {
    (function(){
      var tidioScript = document.createElement('script')
      tidioScript.src = '//code.tidio.co/yjqrzxjoiv1q2bus7gwqesqf4ous5s3q.js'
      tidioScript.async = true
      document.body.appendChild(tidioScript)
    })()
  }, [])

  return null
}

export default ChatWidget