import React from 'react'
import { Routes, Route, useLocation, Outlet } from 'react-router-dom'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import Progress from './Student/Progress'
import Tasks from './Student/Tasks'
import MyGroup from './Student/MyGroup'
import SideBar from './SideBar'
import FypIdeas from './Student/FypIdeas'
import Notification from './Notification'
import StuDash from './Student/StuDash'
import Dashboard from './Dashboard'

const StudentMain = (props) => {
  const location = useLocation();

  // Define an array of paths where the sidebar should not be shown
  const pathsWithoutSidebar = ['/', '/forgotpassword', '/studentMain'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);
  return (
    <div>
      <>
        <div>
          {!showSidebar && (
            <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress' user='studentMain'
              link2='progress' title3='Tasks' link3='tasks' title4='My Group'
              link4='group' title5='Fyp Ideas' link5='ideas' detailLink='student'
              title6='Notification' link6='notification'
            />
          )}
        </div>
        <Routes>
          <Route path='/' exact element={<Login showAlert={props.showAlert}
            formHeading='Student Login' mainHeading='FYP PROCTORING'
            loginRoute='/student/login' path='/studentMain/dashboard' />} />
          <Route path='/forgotpassword' exact element={<ForgotPassword showAlert={props.showAlert} />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/progress' element={<Progress />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/group' element={<MyGroup />} />
          <Route path='/ideas' element={<FypIdeas />} />
          <Route path='/notification' element={<Notification user='student' />} />
        </Routes>
      </>

    </div>
  )
}

export default StudentMain
