import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import Progress from './Student/Progress'
import Tasks from './Student/Tasks'
import MyGroup from './Student/MyGroup'
import Dashboard from './Dashboard'
import SideBar from './SideBar'
import FypIdeas from './Student/FypIdeas'
import Notification from './Notification'

const StudentMain = (props) => {
  return (
    <div>
      <> 
      <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress'
        link2='progress' title3='Tasks' link3='tasks' title4='My Group' link4='group'
         title5='Fyp Ideas' link5='ideas' detailLink='student'  title6='Notification' link6='notification'
      />
        <Routes>
          <Route path='/' exact element={<Login showAlert={props.showAlert} 
          formHeading='Student Login' mainHeading='FYP PROCTORING'
          loginRoute='/student/login' path='/dashboard' />} />
          <Route path='/forgotpassword' exact element={<ForgotPassword showAlert={props.showAlert} />} />
          <Route path='/dashboard'  element={<Dashboard/>} /> 
          <Route path='/progress'  element={<Progress/>} />
          <Route path='/tasks'  element={<Tasks/>} />
          <Route path='/group'  element={<MyGroup/>} />
          <Route path='/ideas'  element={<FypIdeas/>} />
          <Route path='/notification'  element={<Notification user='student'/>} />
        </Routes>
      </>

    </div>
  )
}

export default StudentMain
