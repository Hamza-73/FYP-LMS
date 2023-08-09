import React from 'react'
import SideBar from './SideBar'

const Dashboard = (props) => {
  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2 = 'Project Progress' link2='progress' title3='Tasks' link3='tasks'  title4='My Group' link4='group'  username={props.username}
        />
        DashBoard will be shpwn here
    </div>
  )
}

export default Dashboard
