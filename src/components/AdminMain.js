import React from 'react'
import SideBar from './SideBar'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import Dashboard from './Dashboard'
import { Route, Routes, useLocation } from 'react-router-dom'
import CommitteeMember from './Committee/CommitteeMember'
import StudentList from './Committee/StudentList'
import SupervisorList from './Committee/SupervisorList'

const AdminMain = () => {
    const location = useLocation()
  // Define an array of paths where the sidebar should not be shown
  const pathsWithoutSidebar = ['/', '/forgotpassword', '/adminMain', '/adminMain/forgotpassword'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);

  return (
    <div>
      <>
        <div>
          {!showSidebar && (
            <SideBar title1='Dashboard' link1='dashboard' title2='Committee Members'
             link2='members' user='adminMain' detailLink = 'admin' title3='Students' link3='student'
             hide='d-none' title4='Supervisor List' link4='supervisor'
            />
          )}
        </div>
        <Routes>
          <Route path='/' exact element={<Login 
            formHeading='Admin Login' mainHeading='FYP PROCTORING' user='adminMain'
            loginRoute='/admin/login' path='/adminMain/dashboard' />} />
          <Route path='/forgotpassword' exact element={<ForgotPassword detailLink='admin'  />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/members' element={<CommitteeMember  detailLink='admin'/>} />
          <Route path='/student' element={<StudentList  detailLink='admin'/>} />
          <Route path='/supervisor' element={<SupervisorList  detailLink='admin'/>} />
        </Routes>
      </>
    </div>
  )
}

export default AdminMain
