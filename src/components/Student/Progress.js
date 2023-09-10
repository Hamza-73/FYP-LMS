import React, { useEffect, useState } from 'react'
import '../../css/progress.css'
import graph from '../../images/graph.png'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Loading from '../Loading';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const Progress = (props) => {

    const graphStyle = {
        width: "280px",
        height: "200px"
    }
    const [percentage, setPercentage] = useState(25);

    // eslint-disable-next-line
    const [request, setRequest] = useState({
        username: "", projectTitle: "", description: "",
        scope: "", status: false
    });
    const [groupDetails, setGroupDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [graph, setGraph] = useState({
        meetingTitle: '', type: '', date: '', time: '', purpose: ''
    })


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
            if (json) {
                console.log('group detail is ', json)
                setGroupDetails(json);
                setGraph(json.group.meetingReport);
            }
            if (json.success && json.message) {
                NotificationManager.success(json.message);
            }
        } catch (error) {
            console.log('error in fetching progress', error)
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
                setLoading(false)
            }, 1300)
        }

    }, []);

    useEffect(() => {
        if (groupDetails.group) {
            let updatedPercentage = 25; // Initialize with a base value

            if (groupDetails.group.proposal) {
                updatedPercentage += 25;
            }
            if (groupDetails.group.documentation) {
                updatedPercentage += 20;
            }
            if (groupDetails.group.finalSubmission) {
                updatedPercentage += 20;
            }
            if (groupDetails.group.marks > 0)
                updatedPercentage += 10;

            setPercentage(updatedPercentage);
        }
    }, [groupDetails]);


    const generateRandomMeetingData = (count) => {
        const meetingData = [];

        for (let i = 1; i <= count; i++) {
            const meetingName = `Meeting ${i}`;
            const pv = Math.floor(Math.random() * 30); // Random value for pv (e.g., attendees)
            const uv = Math.floor(Math.random() * 20); // Random value for uv (e.g., engagement)

            meetingData.push({
                name: meetingName,
                pv: pv,
                uv: uv,
            });
        }

        return meetingData;
    };

    // Generate 5 random meetings for the BarChart
    const randomMeetingData = generateRandomMeetingData(5);

    return (
        <>

            {!loading ? (
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
                                                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }}>
                                                    Send Request
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                    {groupDetails.group ? (
                        <>
                            <div className='containar'>
                                <div className='my-3 box mx-4'>
                                    <h3>Meeting Progress</h3>
                                    <BarChart width={400} height={200} data={graph}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="meetingTitle" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `Date: ${value}`} />
                                        <Legend />
                                        <Bar dataKey="date" fill="#8884d8" name="Meeting Date" />
                                    </BarChart>
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
                                            <td>{groupDetails.group.proposal ? "Submitted" : 'Pending'}</td>
                                            <td>{groupDetails.group.propDate}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Proposal</td>
                                            <td>{groupDetails.group.proposal ? "Submitted" : 'Pending'}</td>
                                            <td>{groupDetails.group.propDate}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Project Documentation</td>
                                            <td>{groupDetails.group.documentation ? "Submitted" : 'Pending'}</td>
                                            <td>{groupDetails.group.docDate}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                        <tr>
                                            <td>Viva</td>
                                            <td>{groupDetails.group.viva ? "Taken" : 'Pending'}</td>
                                            <td>{'-----'}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>
                        </>
                    ) : <><h1 className='text-center my-3'>You're not currently enrolled in any Group</h1> </>}
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end buttonCls" >
                        <button style={{ background: "maroon" }} type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModal" disabled={groupDetails.group}>
                            Request Idea
                        </button>
                    </div>
                </>
            ) : <Loading />}
        </>
    )
}

export default Progress;
