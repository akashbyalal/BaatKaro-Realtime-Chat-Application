import React, { useContext, useEffect, useState } from 'react'
import './chat.css'
import Leftsb from '../../components/leftsb/leftsb'
import Middle from '../../components/middle/middle'
import Rightsb from '../../components/rightsb/rightsb'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const { chatdata, userdata } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userdata !== null && chatdata !== null) {
      setLoading(false)
    }
  }, [chatdata, userdata])

  return (
    <div className="chat">
      {loading ? (
        <p className='loading'>Thoda Sabr karo...  </p>
      ) : (
        <div className="chat-container">
          <Leftsb />
          <Middle />
          <Rightsb />
        </div>
      )}
    </div>
  )
}

export default Chat