import React, { useEffect, useState } from 'react'
import Loading from '../Loading'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { useLocation } from 'react-router-dom';

const Permission = () => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState({ requests: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [userData, setUserData] = useState({ member: [] });
    const location = useLocation()
    // Define an array of paths where the sidebar should not be shown
    const pathsWithoutSidebar = ['/', '/forgotpassword', '/adminMain', '/adminMain/forgotpassword'];

    // Check if the current location is in the pathsWithoutSidebar array
    const showSidebar = pathsWithoutSidebar.includes(location.pathname);

    const getRequests = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:5000/admin/get-sup-requests`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem('token')
                }
            });
            const json = await response.json();
            console.log('json is ', json);
            setRequests(json);
            setLoading(false)
        } catch (error) {
            console.log('error getting rquests', error);
        }
    }

    useEffect(() => {
        const getDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('token not found');
                    return;
                }

                const response = await fetch(`http://localhost:5000/admin/detail`, {
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
                    setLoading(false)
                }
            } catch (err) {
                console.log('error is in sidebar: ', err);
            }
        };

        if (localStorage.getItem('token')) {
            setLoading(true);
            setTimeout(() => {
                getDetail();
                getRequests();
                setLoading(false)
            }, 1200)
        }
    }, []);

    const givePermission = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/admin/give-permission/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': token
                }
            });
            const json = await response.json();
            console.log("json is ", json);
            if(json.success)
                NotificationManager.success(json.message);
        } catch (error) {
            console.log('error giving permision', error);
        }
    }

    const handleNextPage = () => {
        if (currentPage < Math.ceil(requests.requests.length / recordsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            {loading ? (<Loading />) : (<>
                <div className='container'>
                    <h3 className='text-center'>Supervisor's Requests for Password Reset</h3>
                    <div className="mb-3">
                        <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
                        <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
                            setRecordsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to the first page when changing the number of records per page
                        }}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    {requests.requests.length > 0 ? (
                        <table className="table table-hover text-center">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Designation</th>
                                    {(!showSidebar && !userData.member.isAdmin) && (
                                        <th scope="col">Allow</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.requests.map((request, reKey) => (
                                    <tr key={reKey}>
                                        <td>{request.name}</td>
                                        <td>{request.designation}</td>

                                        {(!showSidebar && !userData.member.isAdmin) && (
                                            <td><button className="btn btn-sm"
                                            style={{ background: "maroon", color: "white" }}
                                            onClick={ () => givePermission(request.userId) }
                                            >Allow</button></td>
                                        )}
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    ) : (
                        <div>No matching members found.</div>
                    )}
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-success" disabled={currentPage === 1} onClick={handlePrevPage}
                        >  Previous </button>
                        <button type="button" className="btn btn-success" disabled={currentPage === Math.ceil(requests.requests.length / recordsPerPage)} onClick={handleNextPage}
                        >  Next </button>
                    </div>
                </div>
                {(!showSidebar && !userData.member.isAdmin) && (
                    <div className="d-grid gap-2 col-6 mx-auto my-4">
                        <button style={{ background: "maroon" }} type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal">
                            Register
                        </button>
                    </div>
                )}
                <NotificationContainer />
            </>)}
        </div>
    )
}

export default Permission
