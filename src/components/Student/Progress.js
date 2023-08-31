import React, { useState } from 'react'
import SideBar from '../SideBar'
import '../../css/progress.css'
import graph from '../../images/graph.png'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';


const Progress = (props) => {

    const graphStyle = {
        width: "280px",
        height: "200px"
    }
    const percentage = 15;

    const data = [
        { tasks: "Task1", status: 'Completed', duedate: "27-09-2023", subdate: "02-10-2023" },
        { tasks: "Task2", status: 'Pending', duedate: "20-05-2023", subdate: "02-10-2023" },
        { tasks: "Task1", duedate: "09-11-2023", subdate: "02-10-2023" },
    ]
    // eslint-disable-next-line
    const [request, setRequest] = useState({ username: "", projectTitle: "", description: "",
        scope: "", status: false
    });

    const sendRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await axios.post("http://localhost:5000/login/send-project-request", {
                username: "umair",
                projectTitle: "BANK",
                description: "desc",
                scope: "scope",
                status: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const json = await response.data;
            console.log('json is ', json); // Log the response data to see its structure
            if(json){
                props.showAlert('Request sent ', 'success');
                setRequest(json);
            }

        } catch (error) {
            alert(`Some error occurred: ${error.message}`, 'danger');
        }
    }

    
    const handleChange = (e)=>{
        setRequest({...request, [e.target.name]:[e.target.value]})
    }

    return (
        <>
            <>
                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Your Request</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form >
                                    <form>
                                        <div class="mb-3">
                                            <label for="exampleInputEmail163" class="form-label">Supervisor Username</label>
                                            <input type="text" class="form-control" id="username" name='username' value={request.username}  onChange={handleChange}/>
                                        </div>
                                        <div class="mb-3">
                                            <label for="exampleInputPassword331" class="form-label">Project Title</label>
                                            <input type="password" class="form-control" id="projectTitle" name='projectTitle' value = {request.projectTitle} onChange={handleChange} />
                                        </div>
                                        <div class="mb-3">
                                            <label for="exampleInputPassword13" class="form-label">Scope of Study</label>
                                            <input type="password" class="form-control" id="scope" name='scope' value={request.scope} onChange={handleChange} />
                                        </div>
                                        <div class="mb-3">
                                            <label for="exampleInputPassword153" class="form-label">Description</label>
                                            <div class="form-floating">
                                                <textarea class="form-control" id="description" name='description' value={request.description} onChange={handleChange}></textarea>
                                            </div>
                                        </div>
                                    </form>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button style={{background:"maroon"}} type="button" className="btn btn-danger" onClick={sendRequest}>Send Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress' link2='progress' title3='Tasks' link3='tasks' title4='My Group' link4='group' title5='Meeting' link5='meeting' username={props.username}
            />
            <div className='containar'>
                <div className="box my-3 mx-4">
                    <h3>Meeting Report</h3>
                    <img src={graph} alt="" style={graphStyle} />
                </div><div className="box my-3 mx-4">
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
                        {data.map((val, key) => {
                            return (
                                <tr key={key}>
                                    <td><h5>{val.tasks}</h5></td>
                                    <td><h5>{val.status}</h5></td>
                                    <td><h5>{val.duedate}</h5></td>
                                    <td><h5>{val.subdate}</h5></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end buttonCls" >
                    <button style={{background:"maroon"}} type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        Request Idea
                    </button>
                </div>
            </div>
        </>
    )
}

export default Progress
