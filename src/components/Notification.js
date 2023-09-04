import React, { useEffect, useState } from 'react'
import Loading from './Loading';

const Notification = () => {

    const [notification, setNotification] = useState({ notification: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getNotification = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/supervisor/notification`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });
                const json = await response.json();
                console.log('notification is ', json);
                setNotification(json);
                setLoading(false);
            } catch (error) {

            }
        }

        if (localStorage.getItem('token')) {
            setTimeout(() => {
                getNotification();
            }, 1000)
        }
    }, [])
    return (
        <div style={{marginTop:"3%"}}>

            {notification.notification.length>0 ? notification.notification.map((elm, elmKey) => {
                return (
                    <div style={{position:"relative", left:"50px"}}>
                        <div style={{height:"50px", width:"70%"}} class="alert alert-primary alert-dismissible fade show" role="alert">
                            <strong style={{border:"2px solid black", borderRadius:"6px", padding:"5px"}}>Important</strong>    {elm.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>
                )
            }): <h2 className='text-center'>No New Messages</h2> }
        </div>
    )
}

export default Notification
