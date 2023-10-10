import React, { useEffect, useState } from 'react';
import '../../css/progress.css';
import graph from '../../images/graph.png';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Loading from '../Loading';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';

const Progress = (props) => {

    const [percentage, setPercentage] = useState(25);
    const [review] = useState(props.review); // assuming review is a prop passed to your component
    const [meetingReport, setMeetingReport] = useState([
        {
            id: "1",
            date: "2023-10-1",
            review: true,
            value: 4
        },
        {
            id: "2",
            date: "2023-9-4",
            review: false,
            value: 2
        },
        {
            id: "3",
            date: "2023-10-15",
            review: false,
            value: 5
        }, ,
        {
            id: "2",
            date: "2023-9-4",
            review: false,
            value: 2
        },
        {
            id: "3",
            date: "2023-8-5",
            review: true,
            value: 5
        },
        {
            id: "3",
            date: "2023-11-5",
            review: true,
            value: 5
        },

    ]);

    const [chartData, setChartData] = useState([]);

    const parseDate = (dateString) => {
        const dateObj = new Date(dateString);
        const month = dateObj.getMonth() + 1; // Adding 1 because months are 0-based
        const year = dateObj.getFullYear();
        return `${month}-${year}`;
    };

    useEffect(() => {
        // Transform meetingReport data to get counts for each month
        const transformedData = meetingReport.reduce((acc, meeting) => {
            const monthYear = parseDate(meeting.date);

            if (!acc[monthYear]) {
                acc[monthYear] = { trueCount: 0, falseCount: 0, monthYear }; // Include monthYear property
            }

            if (meeting.review) {
                acc[monthYear].trueCount++;
            } else {
                acc[monthYear].falseCount++;
            }

            return acc;
        }, {});

        // Convert the object back to an array
        const chartData = Object.values(transformedData);
        console.log('Transformed Data:', chartData);
        setChartData(chartData);
    }, [meetingReport]);


    const [request, setRequest] = useState({
        username: '', projectTitle: '',
        description: '', scope: '', status: false,
    });
    const [groupDetails, setGroupDetails] = useState({});
    const [loading, setLoading] = useState(false);


    const sendRequest = async (e) => {
        try {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch(`http://localhost:5000/student/send-project-request`, {
                method: 'POST', // Change to POST
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify({
                    username: request.username,
                    projectTitle: request.projectTitle, description: request.description,
                    scope: request.scope, status: false,
                }),
            });
            const json = await response.json();
            if (json.success && json.message) {
                handleClose();
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log('error is ', error);
            alert(`Some error occurred: ${error.message}`, 'danger');
        }
    };

    const groupDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch('http://localhost:5000/student/my-group', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            });

            const json = await response.json();
            if (json) {
                console.log('group detail is ', json);
                setGroupDetails(json);
                setMeetingReport(json.group.meetingReport); // Set meetingReport state with the fetched data
            }
            if (json.success && json.message) {
                NotificationManager.success(json.message);
            }
        } catch (error) {
            console.log('error in fetching progress', error);
        }
    };

    const handleChange = (e) => {
        // Use regular expressions to remove consecutive spaces
        const value = e.target.value.replace(/\s+/g, ' ');
        setRequest({ ...request, [e.target.name]: value });
    };


    useEffect(() => {
        setLoading(true);
        if (localStorage.getItem('token')) {
            setTimeout(() => {
                groupDetail();
                setLoading(false);
            }, 1300);
        }
    }, []);

    useEffect(() => {
        if (groupDetails.group) {
            let updatedPercentage = 25; // Initialize with a base value

            if (groupDetails.group.proposal) {
                updatedPercentage += 25;
            }
            if (groupDetails.group.documentation) {
                updatedPercentage += 30;
            }
            if (groupDetails.group.marks > 0) updatedPercentage += 20;

            setPercentage(updatedPercentage);
        }
    }, [groupDetails]);

    const handleClose = () => {
        setRequest({
            username: '', projectTitle: '',
            description: '', scope: '', status: false,
        });
    }


    return (
        <>
            {!loading ? (
                <>
                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">
                                        Your Request
                                    </h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}></button>
                                </div>
                                <div className="modal-body">
                                    <>
                                        <form onSubmit={sendRequest}>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputEmail163" className="form-label">
                                                    Supervisor Username
                                                </label>
                                                <input type="text" className="form-control" id="username" name="username" value={request.username} onChange={handleChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputPassword331" className="form-label">
                                                    Project Title
                                                </label>
                                                <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={request.projectTitle} onChange={handleChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputPassword13" className="form-label">
                                                    Scope of Study
                                                </label>
                                                <input type="text" className="form-control" id="scope" name="scope" value={request.scope} onChange={handleChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputPassword153" className="form-label">
                                                    Description
                                                </label>
                                                <div className="form-floating">
                                                    <textarea className="form-control" id="description" name="description" value={request.description} onChange={handleChange}
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close"
                                                    onClick={handleClose}
                                                > Close</button>
                                                <button type="submit"
                                                    className="btn"
                                                    style={{ background: 'maroon', color: 'white' }}
                                                    disabled={!request.projectTitle || !request.scope || !request.description}
                                                >
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
                            <div className="container d-flex">
                                <div className="d-flex mx-6" style={{ position: "relative", marginLeft: "10%" }}>
                                    <div className="my-3 box mx-4">
                                        <h3>Meeting Progress</h3>
                                        {meetingReport.length > 0 ? <BarChart width={350} height={200} data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="monthYear" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="trueCount" fill="red" name="Successful" />
                                            <Bar dataKey="falseCount" fill="blue" name="Unsuccessful" />
                                        </BarChart>

                                            : <h4 className='my-6'>No Meetings Yet</h4>}

                                    </div>
                                    <div className="box my-3 mx-4">
                                        <h3>Project Report</h3>
                                        <div style={{ width: '190px', marginLeft: '25%' }}>
                                            <CircularProgressbar value={percentage} text={`${percentage}%`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <h4>Task</h4>
                                            </th>
                                            <th>
                                                <h4>Status</h4>
                                            </th>
                                            <th>
                                                <h4>Due Date</h4>
                                            </th>
                                            <th>
                                                <h4>Submission Date</h4>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Proposal</td>
                                            <td>{groupDetails.group.proposal ? 'Submitted' : 'Pending'}</td>
                                            <td>{groupDetails.group.propDate ? new Date(groupDetails.group.propDate).toLocaleDateString('en-US') : '---'}</td>
                                            <td>{groupDetails.group.propSub ? new Date(groupDetails.group.propSub).toLocaleDateString('en-US') : '---'}</td>
                                        </tr>
                                        <tr>
                                            <td>Project Documentation</td>
                                            <td>{groupDetails.group.documentation ? 'Submitted' : 'Pending'}</td>
                                            <td>{groupDetails.group.docDate ? new Date(groupDetails.group.docDate).toLocaleDateString('en-US') : '---'}</td>
                                            <td>{groupDetails.group.docSub ? new Date(groupDetails.group.docSub).toLocaleDateString('en-US') : '---'}</td>
                                        </tr>
                                        <tr>
                                            <td>Viva</td>
                                            <td>
                                                {groupDetails.group.viva.vivaDate ? (new Date(groupDetails.group.viva.vivaDate) > new Date() ? 'Pending' : 'Taken') : '----'}
                                            </td>
                                            <td>{'-----'}</td>
                                            <td>{'-----'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-center my-3" style={{ position:"absolute", transform: "translate(-50%,-50%", left:"50%", top:"50%" }}>You're not currently enrolled in any Group</h1>
                    )}
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end buttonCls">
                        <button
                            type="button"
                            style={{ background: 'maroon' }}
                            className="btn btn-danger"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            disabled={groupDetails.group}
                        >
                            Request Idea
                        </button>
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </>
    );
};

export default Progress;