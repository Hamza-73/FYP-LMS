import './App.css';
import React, { useState } from 'react'
import StudentMain from './components/StudentMain';
import Alert from './components/Alert';
const App = () => {

  const [alert, setAlert] = useState(null)
  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => setAlert(null), 2000)
  }

  return (
    <>
    <Alert alert={alert} />
    <StudentMain showAlert={showAlert} />
        
    </>
  )
}

export default App