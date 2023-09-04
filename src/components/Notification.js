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
        <div>
            Notifications

            {notification.notification.map((elm, elmKey) => {
                return (
                    <>
                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                            <strong>Holy guacamole!</strong>{elm.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </>
                )
            })}
        </div>
    )
}

export default Notification
