import React, { useState } from 'react'
import SideBar from '../SideBar'

const Meeting = (props) => {
    const [meetingLink, setMeetingLink] = useState('');

    const generateMeetingLink = () => {
      // Here you can implement your logic to generate a meeting link.
      // For demonstration purposes, let's generate a simple link.
      const newMeetingLink = 'https://example.com/meeting/' + Math.random().toString(36).substr(2, 9);
      setMeetingLink(newMeetingLink);
    };
  return (
    <div>
    <SideBar title1='Dashboard' link1='dashboard' title2 = 'Project Progress' link2='progress' title3='Tasks' link3='tasks'  title4='My Group' link4='group' title5='Meeting' link5='meeting'  username={props.username}
        />
       <div>
      <h2>Meeting Scheduler</h2>
      <button onClick={generateMeetingLink}>Generate Meeting Link</button>
      {meetingLink && (
        <div>
          <h3>Your Scheduled Meeting Link:</h3>
          <a href={meetingLink} target="_blank" rel="noopener noreferrer">
            {meetingLink}
          </a>
        </div>
      )}
    </div>
    </div>
  )
}

export default Meeting
