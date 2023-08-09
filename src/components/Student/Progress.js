import React from 'react'
import SideBar from '../SideBar'

const Progress = (props) => {
    return (
        <>
        <SideBar title1='Dashboard' link1='dashboard' title2 = 'Project Progress' link2='progress' title3='Tasks' link3='tasks'  title4='My Group' link4='group'  username={props.username}
        />
        <div>
            <div style={{"min-height": "120px;"}}>
                <div className="" id="collapseWidthExample">
                    <div className="card card-body" style={{"width": "300px;"}}>
                        This is some placeholder content for a horizontal collapse. It's hidden by default and shown when triggered.
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Progress
