import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const CumDashboard = (props) => {
  const history = useNavigate();

  const [rules, setRules] = useState({ rule: [] });
  const [role, setRole] = useState({ role: '', rules: [] });
  const [defineRole, setDefineRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalRules, setModalRules] = useState([]);
  const [editRuleIndex, setEditRuleIndex] = useState(-1);
  const [check, setCheck] = useState(false);

  const getRules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      setLoading(true);
      const response = await axios.get("http://localhost:5000/committee/getrules", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const json = await response.data;
      setRules(json);
      setLoading(false);
    } catch (error) {
      NotificationManager.error('Some Error occurred reload page/ try again');
      console.log('error', error);
    }
  }

  const getRole = async (roleName) => {
    try {
      setCheck(true);
      const response = await axios.get(`http://localhost:5000/committee/getrules/${roleName}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setLoading(true);
      const json = await response.data;
      setRole(json);
      setModalRules(json.rules); // Update modalRules with the new rules
      NotificationManager.sucess('Rules fetched successfully');
    } catch (error) {
      console.log('error', error);
    }
  }

  const handleEditRule = (index) => {
    if (index === editRuleIndex) {
      // User clicked "Save" for the same rule, apply the changes
      editRule();
    } else {
      // User clicked "Edit" for a different rule, update editRuleIndex
      setEditRuleIndex(index);
    }
  }

  const editRule = async (e) => {
    try {
      e.preventDefault();
      setCheck(true);
      const response = await axios.put(`http://localhost:5000/committee/editrules/${defineRole}`, {
        rules: modalRules,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.data;
      if (json) {
        NotificationManager.success('Rules Edited Sucessfully');

        // Reset state variables to their initial values
        setDefineRole('');
        setModalRules([]);
        setEditRuleIndex(-1);

        // Update the rules in the setRules state immediately
        setRules((prevRules) => ({
          ...prevRules,
          rule: prevRules.rule.map((item) => {
            if (item.role === defineRole) {
              return {
                ...item,
                rules: modalRules,
              };
            }
            return item;
          }),
        }));
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
      setCheck(false);
    }
  }


  const addRuleInput = () => {
    // Add an empty rule to modalRules when the user clicks "Add Rule"
    setModalRules([...modalRules, '']);
  }

  const deleteRuleInput = (index) => {
    // Remove the rule at the specified index when the user clicks "Delete"
    const updatedRules = modalRules.filter((_, i) => i !== index);
    setModalRules(updatedRules);
  }

  const handleRuleChange = (index, newValue) => {
    // Update the rule at the specified index when the user types in the input
    const updatedRules = [...modalRules];
    updatedRules[index] = newValue;
    setModalRules(updatedRules);
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getDetail();
      getRules();
    } else {
      history('/');
    }
  }, []);

  const capitilize = (word) => {
    return word[0].toUpperCase() + word.slice(1, word.length)
  }

  // Function to reset the modal state
  const resetModalState = () => {
    setDefineRole('');
    setModalRules([]);
    setEditRuleIndex(-1);
  };

  const [userData, setUserData] = useState({ member: [] });

  const getDetail = async () => {
    try {
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
      }
    } catch (err) {
      console.log('error is in sidebar: ', err);
    }
  };

  return (
    <div>
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Rules</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    name='role'
                    value={defineRole}
                    onChange={(e) => setDefineRole(e.target.value)}
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="evaluation criteria">Evaluation Criteria</option>
                    <option value="extension rule">Extension Rule</option>
                  </select>
                </div>
                {modalRules.map((val, key) => (
                  <div className="mb-3" key={key}>
                    <label htmlFor={`rule-${key}`} className="form-label">Rule {key + 1}</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id={`rule-${key}`}
                        value={val}
                        onChange={(e) => handleRuleChange(key, e.target.value)}
                      />
                      <button type="button" className="btn btn-secondary" onClick={() => handleEditRule(key)}>
                        {key === editRuleIndex ? 'Save' : 'Edit'}
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => deleteRuleInput(key)}>Delete</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-success" onClick={addRuleInput}>Add Rule</button>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => {
                setLoading(false); resetModalState()
              }}>Close</button>
              <button type="button" className="btn btn-warning" onClick={() => getRole(defineRole)} disabled={!defineRole}>Get Roles</button>
              <button type="button" className="btn" style={{ background: "maroon", color: "white" }} onClick={(e) => editRule(e)} disabled={!modalRules || !check}>Edit Rules</button>
            </div>
          </div>
        </div>
      </div>

      <div className='my-2 mx-4' style={{ border: "none" }}>
        {!loading ? rules.rule.map((elm, index) => {
          return (
            <div className="rules" key={index}>
              <h3 style={{ fontWeight: "600", fontFamily: " 'Libre Baskerville', sans-serif" }}>{capitilize(elm.role)}</h3>
              <ol style={{ paddingRight: "300px" }}>
                {elm.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex}>{rule}</li>
                ))}
              </ol>
            </div>
          );
        }) : <Loading />}
      </div>

      {userData.member.isAdmin && <div className='d-grid gap-2 d-md-flex justify-content-md-end' style={{ position: "relative", right: "5.5rem", bottom: "2rem" }}>
        <button style={{ background: "maroon" }} type="button" className="btn btn-danger " data-bs-toggle="modal" data-bs-target="#exampleModal">
          Edit Rules
        </button>
      </div>}
      <NotificationContainer />
    </div>
  );
};

export default CumDashboard;