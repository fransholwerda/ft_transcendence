import { useEffect, useState } from 'react'
import './App.css'
import io, { Socket } from "socket.io-client"
import MessageInput from './chat/MessageInput'
// import Messages from './chat/Messages'
// import LoginForm from './Login/LoginForm'
import Sidebar from './sidebar/sidebar'

function App() {
  const [socket, setSocket] = useState<Socket>()
//   const[messages, setMessages] = useState<string[]>([])
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  const send = (value: string) => {
    socket?.emit("message", value)
  }
  useEffect(() => {
    const newSocket=io("http://localhost:8005")
    setSocket(newSocket)
  },[setSocket])

  const messageListener = (message: string) => {
    // setMessages([...messages, message])
	setMessages((prevMessages) => [...prevMessages, { sender: 'You', text: message }]);
  }
  useEffect(() => {
    socket?.on("message", messageListener)
    return () => {
      socket?.off("message", messageListener)
    }
  },[messageListener])
  return (
	<div>
      <Sidebar messages={messages} />
      <div className="chat-container">
	    <MessageInput send={send}/>
      </div>
    </div>
    // <>
    //   {" "}
    //   <LoginForm/>
    //   <MessageInput send={send}/>
    //   {/* <Messages messages={messages}/> */}
	//   <Sidebar messages={messages}/>
    // </>
  )
}

export default App
