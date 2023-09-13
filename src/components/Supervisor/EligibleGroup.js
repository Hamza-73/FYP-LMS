import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker';

const EligibleGroup = (props) => {
    const [group, setGroup] = useState({ groups: [] });
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [deadline, setdeadline] = useState({ dueDate: '', type: '' });


    const [viva, setViva] = useState({ projectTitle: '', vivaDate: new Date(), vivaTime: '' });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ vivas: [] });
    const [isFieldsModified, setIsFieldsModified] = useState(false);
    const [editMode, selectEditMode] = useState(false);

    const [isInvalidDate, setIsInvalidDate] = useState(false);

    const getProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await fetch("http://localhost:5000/committee/progress", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            console.log('prograa is ', json)
            setGroup(json);
        } catch (error) {
            console.log(`Some error occurred: ${error.message}`);
        }
    }

    const editViva = async (e) => {
        try {
            e.preventDefault();
            const response = await fetch(`http://localhost:5000/viva/edit`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectTitle: viva.projectTitle,
                    vivaDate: viva.vivaDate,
                    vivaTime: viva.vivaTime,
                }),
            });
            const json = await response.json();
            console.log('json in handle requests is ', json);

            if (json.message && json.success) {
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log('error scheduling viva', error);
            NotificationManager.error(`Some error occurred try to reload the page/ try again`);
        }
    }

    const scheduleViva = async (e) => {
        try {
            e.preventDefault();
            const response = await fetch(`http://localhost:5000/viva/schedule-viva`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectTitle: viva.projectTitle,
                    vivaDate: viva.vivaDate,
                    vivaTime: viva.vivaTime,
                }),
            });
            const json = await response.json();
            console.log('json in handle requests is ', json);

            if (json.message && json.success) {
                NotificationManager.success(json.message);
            } else {
                NotificationManager.error(json.message);
            }
        } catch (error) {
            console.log('error scheduling viva', error);
            NotificationManager.error(`Some error occurred try again/reload page`);
        }
    };

    const handleDate = async (e) => {
        try {
            e.preventDefault();
            console.log('duedate starts');
            const response = await fetch(`http://localhost:5000/committee/dueDate/${selectedGroupId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ dueDate: deadline.date, type: deadline.type })
            });
            const json = await response.json();
            if (json)
                alert(json.message)

        } catch (error) {
            console.log(`Some error occurred: ${error}`);
        }
    }

    const typeOptions = ['final', 'proposal', 'documentation']

    useEffect(() => {
        setTimeout(() => {
            getProjects();
        }, 1000)
    }, []);

    const handleChange = (e) => {
        setdeadline({ ...deadline, [e.target.name]: e.target.value });
    }

    const handleChange1 = (e) => {
        setViva({ ...viva, [e.target.name]: e.target.value });
    };

    const handleCalendarChange = (date) => {
        // Prevent selecting dates behind the current date
        const currentDate = new Date();
        if (date < currentDate) {
            setIsInvalidDate(true); // Set invalid date flag to true
            return; // Don't update the state if the selected date is behind the current date
        }

        setViva({ ...viva, vivaDate: date });
        setIsFieldsModified(true); // Field modified, enable the button
        setIsInvalidDate(false); // Reset invalid date flag
    };

    const handleTimeChange = (time) => {
        setViva({ ...viva, vivaTime: time });
        setIsFieldsModified(true); // Field modified, enable the button
    };

    return (
        <div>
            <div>
                <div className="Deadline"  >
                    <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" >Give Reamrks</h5>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={(e) => handleDate(e, selectedGroupId)}>
                                        <div className="mb-3">
                                            <label htmlFor="remrks" className="form-label">Type</label>
                                            <select className="form-control" id="type" name='type' value={deadline.type} onChange={handleChange}>
                                                <option value="">Select Type</option>
                                                {typeOptions.map((option, index) => (
                                                    <option key={index} value={option}>{option[0].toUpperCase() + option.slice(1, option.length)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="remrks" className="form-label">date</label>
                                            <input type='date' className="form-control" id="date" name='date' value={deadline.date} onChange={handleChange} />
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={(e) => { setdeadline({ type: "", dueDate: "" }); setSelectedGroupId('') }}>Close</button>
                                            <button type="submit" className="btn btn-success" disabled={!deadline.type || !deadline.date}> Add deadline </button>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="viva">
                <div className="modal fade" id="exampleModal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Register</h5>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={editMode ? (e) => editViva(e) : (e) => scheduleViva(e)}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Project Title
                                        </label>
                                        <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={viva.projectTitle} onChange={handleChange1} />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Viva Date
                                        </label>
                                        <Calendar onChange={handleCalendarChange} value={viva.vivaDate} />
                                    </div>
                                    {isInvalidDate && (
                                        <div className="text-danger">Please enter a valid date (not in the past).</div>
                                    )}
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Viva Time
                                        </label>
                                        <div>
                                            <TimePicker onChange={handleTimeChange} value={viva.vivaTime} />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                            Close
                                        </button>
                                        <button type="submit" className="btn btn-danger" style={{ background: 'maroon' }}
                                            disabled={!isFieldsModified || !viva.projectTitle}
                                        >
                                            {editMode ? "Edit" : "Schedule"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {group.groups.length > 0 ? (
                <>
                    <h3 className='text-center my-4'>Project Progress</h3>
                    <div className='container' style={{ width: "100%" }}>
                        <table className='table table-hover'>
                            <thead style={{ textAlign: "center" }}>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">My Group</th>
                                    <th scope="col">Project Proposal</th>
                                    <th scope="col">Documentation</th>
                                    <th scope="col">Final Submission</th>
                                    <th scope="col">Viva</th>
                                    <th scope="col">External</th>
                                    <th scope="col">Grade</th>
                                    <th scope="col">Add Due Date</th>
                                </tr>
                            </thead>
                            <tbody style={{ textAlign: "center" }}>
                                {group.groups
                                    .filter((group) =>
                                        group.projects.every((project) =>
                                            project.proposal && project.documentation && project.finalSubmission
                                        )
                                    ).map((group, groupIndex) => (
                                        group.projects.map((project, projectKey) => (
                                            <tr key={projectKey}>
                                                <td>
                                                    <div>
                                                        {project.students.map((student, studentKey) => (
                                                            <React.Fragment key={studentKey}>
                                                                {student.name}<br />
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>{project.projectTitle}</td>
                                                <td>
                                                    <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                                                        {(group.proposal ? (
                                                            <a href={group.proposal} target="_blank" rel="noopener noreferrer">Proposal</a>
                                                        ) : 'Pending')}
                                                    </div>
                                                </td><td>
                                                    <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                                                        {(group.documentation ? (
                                                            <a href={group.documentation} target="_blank" rel="noopener noreferrer">Documentation</a>
                                                        ) : 'Pending')}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                                                        {(group.finalSubmission ? (
                                                            <a href={group.finalSubmission} target="_blank" rel="noopener noreferrer">Final Submission</a>
                                                        ) : 'Pending')}
                                                    </div>
                                                </td>
                                                <td>{group.vivaDate ? (new Date() > new Date(group.vivaDate) ? 'Taken' :
                                                    <>
                                                        ({new Date(group.vivaDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })})
                                                        <i className="fa-solid fa-pen-to-square" data-toggle="modal" data-target="#exampleModal" onClick={() => {
                                                            selectEditMode(true);
                                                            setViva({ projectTitle: project.projectTitle })
                                                        }}  ></i>
                                                    </>)
                                                    :
                                                    <button className="btn btn-sm" style={{ background: "maroon", color: "white" }} data-toggle="modal" data-target="#exampleModal1" onClick={() => {
                                                        setSelectedGroupId(group._id);
                                                        setViva({ projectTitle: project.projectTitle })
                                                    }}>Add Date</button>}</td>

                                                <td>{group.external ? group.external : 0}</td>
                                                <td>{group.marks ? group.marks : 0}</td>
                                                <td><button className="btn btn-sm" style={{ background: "maroon", color: "white" }} data-toggle="modal" data-target="#exampleModal" onClick={() => setSelectedGroupId(group._id)}>Add Deadline</button></td>
                                            </tr>
                                        ))
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <h2 className='text-center'>No Groups have been enrolled for now.</h2>
            )}
            <NotificationContainer />
        </div>
    );
};

export default EligibleGroup;