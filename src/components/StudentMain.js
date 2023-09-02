import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import Progress from './Student/Progress'
import Tasks from './Student/Tasks'
import MyGroup from './Student/MyGroup'
import Dashboard from './Dashboard'

const StudentMain = (props) => {
  return (
    <div>
      <>
        <Routes>
          <Route path='/' exact element={<Login showAlert={props.showAlert} 
          formHeading='Student Login' mainHeading='FYP PROCTORING'
          loginRoute='/student/login' path='/dashboard' />} />
          <Route path='/forgotpassword' exact element={<ForgotPassword showAlert={props.showAlert} />} />
          <Route path='/dashboard'  element={<Dashboard/>} /> 
          <Route path='/progress'  element={<Progress/>} />
          <Route path='/tasks'  element={<Tasks/>} />
          <Route path='/group'  element={<MyGroup/>} />
        </Routes>
      </>

    </div>
  )
}

export default StudentMain
