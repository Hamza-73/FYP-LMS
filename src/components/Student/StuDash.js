import React, { useEffect, useState } from 'react';
import SideBar from '../SideBar';
import Loading from '../Loading';

const StuDash = () => {
  const [userData, setUserData] = useState({ member: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token not found');
          return;
        }

        const response = await fetch(`http://localhost:5000/student/detail`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          console.log('Error fetching detail', response);
          return;
        }

        const json = await response.json();
        if (json) {
          console.log('User data is: ', json);
          setUserData(json);
          setLoading(false);
        }
      } catch (err) {
        console.log('Error in sidebar: ', err);
      }
    };

    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getDetail();
      }, 700);
    }
  }, []);

  const myStyle = `
    .container {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      margin: 20px;
    }

    .item {
      margin: 8px 0;
      border: 1px solid #d1d1d1;
      padding: 10px;
      background-color: white;
      cursor:pointer;
    }

    .item h3 {
      color: #333;
    }

    .item h6 {
      color: #777;
    }

    .meeting-link a {
      color: #007bff;
      text-decoration: none;
    }

    .meeting-link a:hover {
      text-decoration: underline;
    }
  `;

  return (
    <div>
      {!loading ? (
        <div className='my-3 mx-5'>
          {userData.member.meetingId ? (
            <div className='mx-4 my-5'>
              <style>{myStyle}</style>
              <div className='container'>
                <div className='item'>
                  <h3>Meeting Time</h3>
                  <h6>{userData.member.meetingTime}</h6>
                </div>
                <div className='item'>
                  <h3>Meeting Date</h3>
                  <h6>{userData.member.meetingDate ? new Date(userData.member.meetingDate).toLocaleDateString('en-US') : ''}</h6>
                </div>
                {userData.member.meetingLink ? <div className='item meeting-link'>
                  <h3>Meeting Link</h3>
                  <a href={userData.member.meetingLink} target='_blank' rel='noopener noreferrer'>
                    {userData.member.meetingLink}
                  </a>
                </div>:''}
              </div>
            </div>
          ) : (
            <h1 className='text-center my-5'>You have no meeting scheduled</h1>
          )}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default StuDash;
