import React, { useState } from 'react'
import { useEffect } from 'react';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const Allocate = () => {

    const [allocate, setAllocate] = useState({
        projectTitle: '', newSupervisor: ''
    });

    const handleChange = (e) => {
        setAllocate({ ...allocate, [e.target.name]: [e.target.value] });
    }

    const [userData, setUserData] = useState({ member: [] });

    const getDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('token not found');
                return;
            }

            const response = await fetch(`http://localhost:5000/committee/detail`, {
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
            console.log('json is in sidebar: ', json);
            if (json) {
                //   console.log('User data is: ', json);
                setUserData(json);
            }
        } catch (err) {
            console.log('error is in sidebar: ', err);
        }
    };

    const AllocateSupervisor = async (e) => {
        try {
            e.preventDefault();
            const response = await fetch(`http://localhost:5000/committee/allocate-group`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ projectTitle: allocate.projectTitle, newSupervisor: allocate.newSupervisor })
            });
            const json = await response.json();
            if (json.success) {
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
            setAllocate({
                projectTitle: "", newSupervisor: ""
            })
        } catch (error) {

        }
    }

    useEffect(() => {
        getDetail();
    }, [])

    return (
        <>
            {userData.member.isAdmin ? <div>
                <h1 className='text-center my-4'>Allocate Group</h1>
                <form onSubmit={(e) => AllocateSupervisor(e)} className='container' style={{ border: "none" }}>
                    <div class="mb-3">
                        <label for="exampleInputEmail1" class="form-label"> <h5>Project Title</h5></label>
                        <input type="text" class="form-control" id="exampleInputEmail1" name='projectTitle' value={allocate.projectTitle} aria-describedby="emailHelp" onChange={handleChange} />
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputPassword1" class="form-label"> <h5>New Supervior's Username</h5></label>
                        <input type="text" class="form-control" id="exampleInputPassword1" name='newSupervisor' value={allocate.newSupervisor} onChange={handleChange} />
                    </div>
                    <button type="submit" class="btn" style={{ background: "maroon", color: "white" }}
                        disabled={!allocate.newSupervisor || !allocate.projectTitle}
                    >Allocate</button>
                </form>
                <NotificationContainer />
            </div> : <h1 className='text-center my-6' style={{ position:"absolute", transform: "translate(-50%,-50%", left:"50%", top:"50%" }}>Only Co-Admin has the Authority to Allocate Group</h1>}
        </>
    )
}

export default Allocate
