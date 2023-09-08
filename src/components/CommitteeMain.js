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

const CommitteeMain = (props) => {

    const location = useLocation();

    // Define an array of paths where the sidebar should not be shown
    const pathsWithoutSidebar = ['/', '/forgotpassword', '/committeeMain'];

    // Check if the current location is in the pathsWithoutSidebar array
    const showSidebar = pathsWithoutSidebar.includes(location.pathname);
    return (
        <div>
            <div>
                {!showSidebar && (
                    <SideBar
                        title1='FYP Guidelines' link1='commdashboard' user='committeeMain'
                        title2='Committee Members' link2='members'
                        title3='Supervisor List' link3='supervisor'
                        title4='Student List' link4='student'
                        title5='Project List' link5='project'
                        title6='Schedule Viva' link6='event'
                        detailLink='committee' title7='Project Progress' link7='progress'
                    />
                )}
            </div>
            <Routes>
                <Route path='/' element={<Login showAlert={props.showAlert}
                    formHeading='Committee Login' mainHeading='FYP PROCTORING'
                    loginRoute='/committee/login' path='/committeeMain/commdashboard'
                />} />
                <Route path='/commdashboard' element={<CumDashboard showAlert={props.showAlert} />} />
                <Route path='/project' element={<ProjectList showAlert={props.showAlert} />} />
                <Route path='/student' element={<StudentList showAlert={props.showAlert} />} />
                <Route path='/event' element={<Event showAlert={props.showAlert} />} />
                <Route path='/supervisor' element={<SupervisorList showAlert={props.showAlert} />} />
                <Route path='/members' element={<CommitteeMember showAlert={props.showAlert} />} />
                <Route path='/progress' element={<ProjectProgress />} />
            </Routes>
        </div>
    )
}

export default CommitteeMain
