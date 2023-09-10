import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import SideBar from './SideBar';

const Notification = (props) => {

    const [notification, setNotification] = useState({ notification: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getNotification = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/${props.user}/notification`, {
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
            setLoading(true);
            setTimeout(() => {
                getNotification();
                setLoading(false);
            }, 1000)
        }
    }, [])
    return (
        <>
            {!loading ? <>  <div style={{ marginTop: "3%" }}>

                {notification.notification.length > 0 ? notification.notification.map((elm, elmKey) => {
                    return (
                        <div style={{ position: "relative", left: "50px" }} key={elmKey}>
                            <div style={{ height: "50px", width: "70%" }} class={`alert alert-${elm.type==='Important' || elm.type==='important'?'danger':'primary' } alert-dismissible fade show`} role="alert">
                                <strong style={{ border: `2px solid ${elm.type==='Important' || elm.type==='important'?'#f6abb6':"blue"}`, borderRadius: "6px", padding: "5px" }}>{elm.type}</strong>    {elm.message}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        </div>
                    )
                }) : <h2 className='text-center'>You currently have no New Messages</h2>}
            </div>
            </> : <Loading />}
        </>
    )
}

export default Notification
