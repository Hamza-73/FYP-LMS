import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Student/Login'
import ForgotPassword from './ForgotPassword'
import Student from './Student/Student'
import Progress from './Student/Progress'
import Tasks from './Student/Tasks'
import MyGroup from './Student/MyGroup'
import Dashboard from './Dashboard'

const StudentMain = (props) => {
  return (
    <div>
      <>
        <Routes>
          <Route path='/' exact element={<Login showAlert={props.showAlert} />} index />
          <Route path='/forgotpassword' exact element={<ForgotPassword showAlert={props.showAlert} />} />
          <Route path='/student' exact element={<Student showAlert={props.showAlert} />} />   
          <Route path='/progress'  element={<Progress/>} />
          <Route path='/tasks'  element={<Tasks/>} />
          <Route path='/group'  element={<MyGroup/>} />
          <Route path='/dashboard'  element={<Dashboard/>} />
        </Routes>
      </>

    </div>
  )
}

export default StudentMain
