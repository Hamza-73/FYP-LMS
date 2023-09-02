import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'
import SideBar from './SideBar'
import Group from '../components/Supervisor/Groups'
import GroupDetail from './Supervisor/GroupDetail'
import Meeting from './Meeting'
import ProjectIdeas from './Supervisor/ProjectIdeas'
import ProjectRequest from './Supervisor/ProjectRequests'

const SupervisorMain = (props) => {
  return (
    <div>
        <SideBar detailLink='supervisor' title1='Dashboard' link1='dashboard' title2='Groups Under Me'
        link2='group' title3='Groups' link3='groupDetail' title4='Meeting' link4='meeting'
        title5='FYP Ideas' link5='ideas' title6='FYP Requests' link6='requests'/>
      <Routes>
        <Route path='/' exact element={<Login showAlert={props.showAlert}
          formHeading='Supervisor Login' mainHeading='FYP PROCTORING'
          loginRoute='/supervisor/login' path='/dashboard' />} />
        <Route path='/dashboard' element={<Dashboard showAlert={props.showAlert} />} />
        <Route path='/group' element={<Group showAlert={props.showAlert} />} />
        <Route path='/groupDetail' element={<GroupDetail showAlert={props.showAlert} />} />
        <Route path='/meeting' element={<Meeting showAlert={props.showAlert} />} />
        <Route path='/ideas' element={<ProjectIdeas showAlert={props.showAlert} />} />
        <Route path='/requests' element={<ProjectRequest showAlert={props.showAlert} />} />
      </Routes>
    </div>
  )
}

export default SupervisorMain
