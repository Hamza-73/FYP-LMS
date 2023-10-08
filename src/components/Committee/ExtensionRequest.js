import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const ExtensionRequest = (props) => {
    const history = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [userData, setUserData] = useState({ member: [] });
    const [date, setDate] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            history('/');
        } else {
            // Set loading to true when starting data fetch
            setLoading(true);
            getDetail()
                .then(() => {
                    // Once data is fetched, set loading to false
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false); // Handle error cases
                    console.error('Error fetching data:', error);
                });
        }
    }, []);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const paginate = (array, page_size, page_number) => {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    };

    const filteredDataPaginated = paginate(
        (userData.member && userData.member.requests) ? userData.member.requests : [],
        recordsPerPage,
        currentPage
    );

    const handleNextPage = () => {
        if (currentPage < Math.ceil(userData.member.requests.length / recordsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getDetail = async () => {
        try {
            setLoading(true);
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
                setLoading(false)
            }
        } catch (err) {
            console.log('error is in sidebar: ', err);
        }
    };

    const [ id , setId ] = useState('');

    const extendDate = async (e) => {
        try {
            e.preventDefault();
            console.log('date is ', date)
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('token not found');
                return;
            }
            console.log('date again ', date)
            const response = await fetch(`http://localhost:5000/committee/make-extension/${id}`, {
                method: 'POST',
                headers: {
                    "Content-Type" : "application/json" ,
                    'Authorization': token
                },
                body : JSON.stringify({ date : date })
            });
            const json = await response.json();
            console.log('json in extending requet is : ', json);
            if (json) {
                alert(json.message)
                //   console.log('User data is: ', json);
                setUserData(json);
                getDetail()
            }
        } catch (err) {
            console.log('error in extending : ', err);
        }
    };

    const location = useLocation();
    const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members', '/committeeMain/student', '/committeeMain/external'];

    // Check if the current location is in the pathsWithoutSidebar array
    const showSidebar = pathsWithoutSidebar.includes(location.pathname);

    const style = `
  .heading {
    text-align: center;
    margin-top: 40px;
  }

  .form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .mb-3 {
    margin-bottom: 15px;
  }

  .btn-secondary {
    background-color: white;
    color: black;
  }

  .btn-register {
    background-color: maroon;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-formregister{
    background-color:maroon;
    color:white;
  }
  
`;

    return (
        <>
        <div className="register">
                <style>{style}</style>
                <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Register</h5>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={extendDate}>
                                    <div className="col">
                                        <label htmlFor="name" className="form-label">
                                            Date
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-user"></i>
                                            </span>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="date"
                                                name="date"
                                                value={date}
                                                onChange={(e)=>setDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={()=>setDate('')}>Close</button>
                                            <button type="submit" className="btn btn-success">
                                                Register
                                            </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (<Loading />) : (
                <>
                    <div className='container' style={{ width: "90%" }}>
                        <h3 className='text-center'>Requests for Extension</h3>
                        <div className="mb-3">
                            <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
                            <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
                                setRecordsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, department, or designation"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                        {filteredDataPaginated.length > 0 ? (
                            <table className="table table-hover text-center">
                                <thead style={{textAlign:"center"}}>
                                    <tr style={{textAlign:"center"}}>
                                        <th scope="col">Supervisor</th>
                                        <th scope="col">Group</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Date</th>
                                        {(!showSidebar || userData.member.isAdmin) && <>
                                            <th scope="col">Extend</th>
                                        </>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDataPaginated.map((val, key) => (
                                        <tr key={key}>
                                            <td>{val.supervisor}</td>
                                            <td>{val.group}</td>
                                            <td>{val.type}</td>
                                            <td>{new Date(val.date).toLocaleDateString('en-GB')}</td>
                                            {(userData.member.isAdmin) &&
                                            <td><button className="btn btn-sm" style={{
                                                color:"white", background:"maroon", cursor:"pointer"
                                            }}
                                            onClick={()=>{
                                                setId(val._id)
                                            }}  data-toggle="modal" data-target="#exampleModal"
                                            >Extend</button></td>
                                            }
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
                            <button type="button" className="btn btn-success" disabled={currentPage === Math.ceil(userData.member.requests.length / recordsPerPage)} onClick={handleNextPage}
                            >  Next </button>
                        </div>
                    </div>
                    <NotificationContainer />
                </>
            )}
        </>
    )
}

export default ExtensionRequest;