import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading'

const CumDashboard = (props) => {

    const history = useNavigate()

    const [rules, setRules] = useState({rule:[]});
    const [role, setRole] = useState({ role : '', rules:[]});
    const [defineRole, setDefineRole] = useState('');
    const [upRule, setUpRule] = useState('');
    const [loading,setLoading] = useState(false);

    const getRules = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization token not found', 'danger');
                return;
            }
            setLoading(true); // Set loading to true before API call
            const response = await axios.get("http://localhost:5000/committee/getrules", {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await response.data;
            console.log('json ',json); // Log the response data to see its structure
            setRules(json);
            setLoading(false)
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
            setLoading(true);
            const json = await response.data;
            console.log('json ', json); // Log the response data to see its structure
            setRole(json);
        } catch (error) {
            console.log('error', error)
        }
    }

    const editRule = async (role) => {
        console.log('get role is starting')
        try {
            setLoading(true);
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
        } finally {
            setLoading(false); // Set loading to false after API call
        }
    }

    const handleEditRole = async () => {
        await editRule(defineRole);
        console.log('handle edit rule is completely runned')

    }


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
        try{
            console.log('Get role is called')
            setLoading(true);
            await getRole(defineRole);
            console.log('rules are getroleshandle ' , role.role);
            console.log('length of array is ', role.rules)
             Array.from(role.rules).map((el)=>{
                console.log('inside map', el)
            });
            console.log('array from');
        }catch(err){
            console.log('eror is ', err)
            props.showAlert( `error ${err}`, 'danger')
        } finally{
            setLoading(false)
        }
    };

    console.log('rules us ', role)
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
                                        <input type="text" className="form-control" id="role"  name='role' value={defineRole} onChange={(e) => setDefineRole(e.target.value)} />
                                    </div>
                                    {
                                        !loading ? (
                                            Array.from(role.rules).map((val, key) => (
                                                <div className="mb-3" key={key}>
                                                    <label htmlFor="exampleInputPassword1" className="form-label">
                                                        Rules
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={val}
                                                        
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            "Loading......."
                                        )
                                    }

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
                {
                 !loading ?   rules.rule.map((elm, index) => {
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
                    }) : <Loading/>
                }
            </div>

            <div className="edit">

            </div>

        </div>

    )
}

export default CumDashboard
