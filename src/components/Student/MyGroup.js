import React from 'react'
import SideBar from '../SideBar'

const MyGroup = (props) => {
  return (
    <div>
        
        <SideBar title1='Dashboard' link1='dashboard' title2 = 'Project Progress' link2='progress' title3='Tasks' link3='tasks'  title4='My Group' link4='group'  username={props.username}
        />
      Groups will be shown here
    </div>
  )
}

export default MyGroup
