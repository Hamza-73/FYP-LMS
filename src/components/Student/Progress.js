import React, { useEffect, useState } from 'react'
import '../../css/progress.css'
import graph from '../../images/graph.png'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Loading from '../Loading';


const Progress = (props) => {

    const graphStyle = {
        width: "280px",
        height: "200px"
    }
    const[ percentage, setPercentage ]= useState(25);

    const data = [
        { tasks: "Task1", status: 'Completed', duedate: "27-09-2023", subdate: "02-10-2023" },
        { tasks: "Task2", status: 'Pending', duedate: "20-05-2023", subdate: "02-10-2023" },
        { tasks: "Task1", duedate: "09-11-2023", subdate: "02-10-2023" },
    ]
    // eslint-disable-next-line
    const [request, setRequest] = useState({
        username: "", projectTitle: "", description: "",
        scope: "", status: false
    });
    const [groupDetails, setGroupDetails] = useState({});
    const [loading, setLoading] = useState(false);

    const sendRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            setLoading(true);
            const response = await fetch(`http://localhost:5000/student/send-project-request`, {
                method: 'POST', // Change to POST
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": token
                },
                body: JSON.stringify({
                    username: request.username,
                    projectTitle: request.projectTitle, description: request.description,
                    scope: request.scope, status: false
                })
            });
            const json = await response.json();
            if (json.success && json.message) {
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log('error is ', error)
            alert(`Some error occurred: ${error.message}`, 'danger');
        } finally {
            setLoading(true);
        }
    }

    const groupDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch("http://localhost:5000/student/my-group", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": token
                }
            });

            const json = await response.json();
            if(json){
                setGroupDetails(json)
            }
            if (json.success && json.message) {
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            NotificationManager.success(`Error fetching group ${error}`);
        }
    }

    const handleChange = (e) => {
        setRequest({ ...request, [e.target.name]: e.target.value })
    }

    const handleRequest = async (e) => {
        try {
            console.log('handle request starts')
            e.preventDefault();
            await sendRequest();
        } catch (error) {
            console.log('handle error is ', error)
        }
    }


    useEffect(() => {
        setLoading(true);
        if (localStorage.getItem('token')) {
            setTimeout(() => {
                groupDetail();
                setLoading(false);
               if(groupDetails.group){
                    if(groupDetails.group.proposal)
                        setPercentage(percentage+25);
                    if(groupDetails.group.documentation)
                        setPercentage(percentage+20);
               }
            }, 1300)
        }

    }, [])

    return (
        <>
            {!loading ? (
                <>
                    {groupDetails.group ? (
                        <>
                            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h1 className="modal-title fs-5" id="exampleModalLabel">Your Request</h1>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            <>
                                                <form onSubmit={(e) => handleRequest(e)}>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleInputEmail163" className="form-label">Supervisor Username</label>
                                                        <input type="text" className="form-control" id="username" name='username' value={request.username} onChange={handleChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleInputPassword331" className="form-label">Project Title</label>
                                                        <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={request.projectTitle} onChange={handleChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleInputPassword13" className="form-label">Scope of Study</label>
                                                        <input type="text" className="form-control" id="scope" name='scope' value={request.scope} onChange={handleChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleInputPassword153" className="form-label">Description</label>
                                                        <div className="form-floating">
                                                            <textarea className="form-control" id="description" name='description' value={request.description} onChange={handleChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="modal-footer">
                                                        <button type="submit" className="btn btn-success">
                                                            save
                                                        </button>
                                                    </div>
                                                </form>
                                            </>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='containar'>
                                <div className="box my-3 mx-4">
                                    <h3>Meeting Report</h3>
                                    <img src={graph} alt="" style={graphStyle} />
                                </div>
                                <div className="box my-3 mx-4">
                                    <h3>Project Report</h3>
                                    <div style={{ width: "190px", marginLeft: "25%" }}>
                                        <CircularProgressbar value={percentage} text={`${percentage}%`} />
                                    </div>
                                </div>
                            </div>
                            <div className="table">
                                <table>
                                    <thead>
                                        <th><h4>Task</h4></th>
                                        <th><h4>Status</h4></th>
                                        <th><h4>Due Date</h4></th>
                                        <th><h4>Submission Date</h4></th>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Project Title</td>
                                            <td>{groupDetails.group.proposal?"Submitted":'Pending'}</td>
                                            <td>{groupDetails.group.propDate}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Proposal</td>
                                            <td>{groupDetails.group.proposal?"Submitted":'Pending'}</td>
                                            <td>{groupDetails.group.propDate}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Project Documentation</td>
                                            <td>{groupDetails.group.documentation?"Submitted":'Pending'}</td>
                                            <td>{groupDetails.group.docDate}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Viva</td>
                                            <td>{groupDetails.group.viva?"Taken":'Pending'}</td>
                                            <td>{'-----'}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end buttonCls" >
                                    <button style={{ background: "maroon" }} type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        Request Idea
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : <h1 className='text-center my-3'>You're not currently enrolled in any Group</h1>}
                </>
            ) : <Loading />}
        </>
    )
}

export default Progress;
