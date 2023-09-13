import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './Login'
import CumDashboard from './Committee/CumDashboard'
import SideBar from './SideBar'
import ProjectList from './Committee/ProjectList'
import StudentList from './Committee/StudentList'
import Event from './Committee/Event'
import SupervisorList from './Committee/SupervisorList'
import CommitteeMember from './Committee/CommitteeMember'
import ProjectProgress from './Committee/ProjectProgress'
import ForgotPassword from './ForgotPassword'
import Dashboard from './Dashboard'
import EligibleGroup from './Supervisor/EligibleGroup'

const CommitteeMain = (props) => {

    const location = useLocation();

    // Define an array of paths where the sidebar should not be shown
    const pathsWithoutSidebar = ['/', '/forgotpassword', '/committeeMain', '/committeeMain/forgotpassword'];

    // Check if the current location is in the pathsWithoutSidebar array
    const showSidebar = pathsWithoutSidebar.includes(location.pathname);
    return (
        <div>
            <div>
                {!showSidebar && (
                    <SideBar
                        title1='Home' link1='home'
                        title2='FYP Guidelines' link2='commdashboard' user='committeeMain'
                        title3='Committee Members' link3='members'
                        title4='Supervisor List' link4='supervisor'
                        title5='Student List' link5='student'
                        title6='Project List' link6='project'
                        title7='Scheduled Vivas' link7='event'
                        detailLink='committee' title8='Project Progress' link8='progress'
                        title9='Eligible Groups' link9='eligible'
                    />
                )}
            </div>
            <Routes>
                <Route path='/' element={<Login
                    formHeading='Committee Login' mainHeading='FYP PROCTORING'
                    loginRoute='/committee/login' path='/committeeMain/home' user='committeeMain'
                />} />
                <Route path='/forgotpassword' exact element={<ForgotPassword detailLink='committee' />} />
                <Route path='/commdashboard' element={<CumDashboard />} />
                <Route path='/home' element={<Dashboard />} />
                <Route path='/project' element={<ProjectList />} />
                <Route path='/student' element={<StudentList />} />
                <Route path='/event' element={<Event />} />
                <Route path='/supervisor' element={<SupervisorList />} />
                <Route path='/members' element={<CommitteeMember />} />
                <Route path='/progress' element={<ProjectProgress />} />
                <Route path='/eligible' element={<EligibleGroup />} />
            </Routes>
        </div>
    )
}

export default CommitteeMain
