import React, { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import Loading from '../Loading';

const StuDash = () => {
    const [userData,setUserData]= useState({member:[]});
    const [loading,setLoading] = useState(false);
    useEffect(() => {
        const getDetail = async () => {
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
              console.log('token not found');
              return;
            }
            
            const response = await fetch(`http://localhost:5000/student/detail`, {
              method: 'GET',
              headers: {
                'Authorization': token    
            },
            });
      
            if (!response.ok) {
              console.log('error fetching detail', response);
              return; // Exit early on error
            }
      
            const json = await response.json();
            // console.log('json is in sidebar: ', json);
            if (json) {
              console.log('User data is: ', json);
              setUserData(json);
              setLoading(false)
            }
          } catch (err) {
            console.log('error is in sidebar: ', err);
          }
        };
      
        if (localStorage.getItem('token')) {
            setTimeout(()=>{
                getDetail();
                // console.log('user data is in ', userData)
                // console.log('user data is in ', userData.member)
            },700)
        }
      }, []); // Empty dependency array to run the effect only once 
    return (
        <div>
            { !loading ?  <div>
                    {userData.member.meetingId ? <div>
                        <div className="container" style={{border:"none"}}>
                        <h3>Meeting Time</h3>
                        <h6>{userData.member.meetingTime}</h6>
                        <h3>Meeting Date</h3>
                        <h6>{(userData.member.meetingDate)}</h6>
                        <h3>Meeting Link</h3>
                        <a href={userData.member.meetingLink} target='_blank'>{userData.member.meetingLink}</a>
                        </div>
                        
                    </div> : "You have no meeting scheduled" }
                </div> : <Loading/>
            }
        </div>
    )
}

export default StuDash
