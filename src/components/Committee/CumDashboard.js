import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CumDashboard = (props) => {

    const history = useNavigate()

    const getRules = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            const response = await axios.get("http://localhost:5000/committee/getrules", {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await response.data;
            console.log(json); // Log the response data to see its structure
            setRules(json);
        } catch (error) {
            alert(`Some error occurred: ${error.message}`, 'danger');
            console.log('error', error)
        }
    }

    const getRole = async (role) => {
        console.log('get role is starting')
        try {
            const response = await axios.get(`http://localhost:5000/committee/getrules/${role}`, {
                // method:"GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.data;
            console.log('rules are ', json); // Log the response data to see its structure
            setRole(json);
        } catch (error) {
            console.log('error', error)
        }
    }

    const editRule = async (role) => {
        console.log('get role is starting')
        try {
            const response = await axios.put(`http://localhost:5000/committee/editrules/${role}`,
                {
                    rules: upRule.split(','), // Provide the new rules array here
                }, {
                // method:"GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.data;
            console.log('rules are ', json); // Log the response data to see its structure
            if (json) {
                props.showAlert('Rules Updated Successfully', 'success')
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const handleEditRole = async () => {
        await editRule(defineRole);
        console.log('handle edit rule is completely runned')

    }

    const [rules, setRules] = useState([]);
    const [role, setRole] = useState([]);
    const [defineRole, setDefineRole] = useState();
    const [upRule, setUpRule] = useState('')

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getRules();
            // getRole('student');
        }
        else
            history('/');
    }, [])


    const capitalizeEveryWord = (str) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    const handleGetRole = async () => {
        await getRole(defineRole);
        console.log('rules are ', role.rules)
    };
    return (
        <div>

            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>
            <>
                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label for="role" className="form-label">Role</label>
                                        <input type="text" className="form-control" id="role" aria-describedby="emailHelp" name='role' value={defineRole} onChange={(e) => setDefineRole(e.target.value)} />
                                    </div>
                                    {/* {
                                        role.length > 0 ? (
                                            role.map((val, key) => (
                                                <div className="mb-3" key={key}>
                                                    <label htmlFor="exampleInputPassword1" className="form-label">
                                                        Rules
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={val.rules.join(', ')} // Display joined rules
                                                        readOnly
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            "No rules found"
                                        )
                                    } */}

                                    <div className="mb-3">
                                        <label htmlFor="">Edit Rule</label>
                                        <input className='form-control' type="text" value={upRule} onChange={(e) => { setUpRule(e.target.value) }} />
                                    </div>




                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-secondary" onClick={handleGetRole}>get Roles</button>
                                <button type="button" className="btn btn-secondary" onClick={handleEditRole}>Edit Roles</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            <div className='my-2 mx-4'>
                {/* {
                    rules.rule.map((elm, index) => {
                        return (
                            <div className="rules" key={index}>
                                <h2>{capitalizeEveryWord(elm.role)}</h2>
                                <ol>
                                    {elm.rules.map((rule, ruleIndex) => (
                                        <li key={ruleIndex}>{rule}</li>
                                    ))}
                                </ol>
                            </div>
                        );
                    }) 
                } */}
            </div>

            <div className="edit">

            </div>

        </div>

    )
}

export default CumDashboard
