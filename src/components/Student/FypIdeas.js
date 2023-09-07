import React, { useState, useEffect } from 'react';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const FypIdeas = () => {
    const [group, setGroup] = useState({
        success: false,
        projectDetails: [{
            projectDetails: {
                _id: "", students: [""], projectTitle: "",
                description: "", scope: "", status: false,
            },
            supervisor: null,
            supUsername: null,
            studentsDetail: [
                { name: "", rollNo: "", username: "" }
            ]
        }]
    });
    const [loading, setLoading] = useState(false);
    const [numRows, setNumRows] = useState(10); // State to store the number of rows to display
    const [searchQuery, setSearchQuery] = useState(''); // State to store the search query
    const [filteredGroups, setFilteredGroups] = useState([]); // State to store the filtered groups
    const [projectTitle, setProject] = useState('');

    useEffect(() => {
        const getAvailableGroups = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/projects/projects`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                const json = await response.json();
                console.log('json in fyp is ', json);
                if (json.success) {
                    setGroup(json);
                    setFilteredGroups(json.projectDetails); // Initialize filteredGroups with all groups
                } else {
                    alert(json.message)
                }
            } catch (error) {
                console.log(`error in getting ideas ${error}`)
            } finally {
                setLoading(false);
            }
        }
        if (localStorage.getItem('token')) {
            setLoading(true);
            setTimeout(() => {
                getAvailableGroups();
                setLoading(false);
                console.log('group', group)
            }, 1000)
        }
    }, []);

    const sendRequest = async ()=>{
        try {
            console.log('project is ', projectTitle)
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/student/request-to-join/${projectTitle}`,{
                method:"POST",
                headers:{
                    "Authorization" : token
                }});
                const json = await response.json();
                console.log('json request sent is ', json);
                if(json.success && json.message){
                    NotificationManager.success(json.message);
                }
                else{
                    NotificationManager.error(json.message);
                }
        } catch (error) {
            console.log(`error in sending request ${error}`)
        }
    }

    // Handle the change event of the number of rows selector
    const handleNumRowsChange = (event) => {
        setNumRows(parseInt(event.target.value, 10));
    }

    // Handle the change event of the search input
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        filterGroups(event.target.value);
    }

    // Filter groups based on the search query
    const filterGroups = (query) => {
        if (group.projectDetails) {
            const filtered = group.projectDetails.filter((group) =>
                group.studentsDetail.some((student) =>
                    student.name.toLowerCase().includes(query.toLowerCase()) ||
                    (group.supervisor && group.supervisor.toLowerCase().includes(query.toLowerCase())) ||
                    (group.supUsername && group.supUsername.toLowerCase().includes(query.toLowerCase())) ||
                    group.projectDetails.projectTitle.toLowerCase().includes(query.toLowerCase())
                )
            );
            setFilteredGroups(filtered);
        }
    }


    return (
        <>
            {!loading ? (
                <div>
                    {group.projectDetails ? (
                        <>
                            <h3 className='text-center my-4'>FYP Available Groups</h3>
                            <div className='text-center'>
                                <label htmlFor="numRows"><strong>Records Per Page: </strong></label>
                                <select class="form-select" style={{ width: "6%", textAlign: "center", position: "relative", left: "57%", marginTop: "-30px" }} aria-label="Default select example" id="numRows" value={numRows} onChange={handleNumRowsChange}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='container' style={{ width: '100%' }}>
                                <div>
                                    <div>
                                        <div class="mb-3">
                                            <input type="text" class="form-control text-center" placeholder="Search by name, supervisor, username, or project title"
                                                value={searchQuery}
                                                onChange={handleSearchInputChange} />
                                        </div>
                                        <table className='table table-hover'>
                                            <thead style={{ textAlign: 'center' }}>
                                                <tr>
                                                    <th scope='col'>Students</th>
                                                    <th scope='col'>Supervisor</th>
                                                    <th scope='col'>Supervisor Username</th>
                                                    <th scope='col'>Project Title</th>
                                                    <th scope='col'>Scope</th>
                                                    <th scope='col'>Description</th>
                                                    <th scope='col'>Join Group</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-center'>
                                                {filteredGroups.slice(0, numRows).map((group, groupIndex) => (
                                                    <tr key={groupIndex}>
                                                        <td>
                                                            {group.studentsDetail.length > 0 ? group.studentsDetail.map((student, studentKey) => (
                                                                <React.Fragment key={studentKey}>
                                                                    {!student.name ? "No Student Yet" : student.name}<br />
                                                                </React.Fragment>
                                                            )) : "No Students yet"}
                                                        </td>
                                                        <td>{group.supervisor === null ? "No Supervisor Yet" : group.supervisor}</td>
                                                        <td>{group.supUsername === null ? "No Supervisor Yet" : group.supUsername}</td>
                                                        <td>{group.projectDetails.projectTitle}</td>
                                                        <td>{group.projectDetails.scope}</td>
                                                        <td>{group.projectDetails.description}</td>
                                                        <td><button type='button' className='btn' style={{background:"maroon", color:"white"}} onClick={()=>{
                                                            setProject(group.projectDetails.projectTitle); sendRequest();
                                                        }}>request to join</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <h2 className='text-center'>Currently No Project Idea/ Group is Available.</h2>
                    )}
                </div>
            ) : <Loading />}
            
        <NotificationContainer />
        </>
    )
}

export default FypIdeas;