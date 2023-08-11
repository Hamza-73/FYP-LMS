import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import Progress from './Student/Progress'
import Tasks from './Student/Tasks'
import MyGroup from './Student/MyGroup'
import Dashboard from './Dashboard'
import Meeting from './Student/Meeting'
import ShowProject from './Project/ShowProject'

const StudentMain = (props) => {
  return (
    <div>
      <>
        <Routes>
          <Route path='/' exact element={<Login showAlert={props.showAlert} 
          formHeading='Student Login' mainHeading='FYP PROCTORING'
          loginRoute='/login/login' />} />
          <Route path='/forgotpassword' exact element={<ForgotPassword showAlert={props.showAlert} />} />
          <Route path='/dashboard'  element={<Dashboard/>} /> 
          <Route path='/progress'  element={<Progress/>} />
          <Route path='/tasks'  element={<Tasks/>} />
          <Route path='/group'  element={<MyGroup/>} />
          <Route path='/meeting'  element={<Meeting/>} />
          <Route path='/showproject'  element={<ShowProject showAlert={props.showAlert}/>} />
        </Routes>
      </>

    </div>
  )
}

export default StudentMain
