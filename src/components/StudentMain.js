import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Student/Login'
import ForgotPassword from './ForgotPassword'
import Student from './Student/Student'
import ProjectState from './context/projects/ProjectState.js'

const StudentMain = (props) => {
  return (
    <div>
      <>
      <ProjectState>
        <Routes>
          <Route path='/' exact element={<Login showAlert={props.showAlert} />} index />
          <Route path='/forgotpassword' exact element={<ForgotPassword showAlert={props.showAlert} />} />
          <Route path='/student' exact element={<Student showAlert={props.showAlert} />} />   
        </Routes>
        </ProjectState>
      </>

    </div>
  )
}

export default StudentMain
