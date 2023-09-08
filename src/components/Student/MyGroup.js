import React, { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import '../../css/group.css'
import Loading from '../Loading';

const MyGroup = (props) => {
  const [group, setGroupDetails] = useState({
    success: false,
    group: {
      myDetail: [{ name: "", rollNo: "", myId: "" }],

      groupId: "", supervisor: "", supervisorId: "",
      projectTitle: "", projectId: "",
      groupMember: [{ userId: "", name: "", rollNo: "", _id: "" }],
      proposal: false, documentation: false, docDate: "----",
      propDate: "----", viva: "-----"
    }
  });
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    const groupDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authorization token not found', 'danger');
          return;
        }
        console.log('before fetch')
        const response = await fetch("http://localhost:5000/student/my-group", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": token
          }
        });
        console.log('after fetch')
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        if (!json) {
          console.log('group response is ', response);
        } else {
          console.log('json is ', json);
          setGroupDetails(json);
        }
      } catch (error) {
        console.log('error fetching group ', error)
      }
    }
    if (localStorage.getItem('token')) {
      setLoading(true)
      setTimeout(() => {
        groupDetail();
        setLoading(false)
        console.log('details is in grpouyp ', group.group)
      }, 1000)
    }
  }, [])
  

  return (
    <div>
      {!loading ? <div className={`${group.group ? 'container' : ""}`}>
        {
          group.group ? <>
            <div className="upperpart">
              <div className="proj-detail d-flex justify-content-between">
                <h4>Project Title</h4>
                <h5>{group.group.projectTitle}</h5>
              </div>
              <div className="proj-detail d-flex justify-content-between">
                <h4>Supervisor</h4>
                <h5>{group.group.supervisor}</h5>
              </div>
            </div>

            <div className="mid">
              <h5>{group.group.supervisor}</h5>
              <h5>{group.group.groupMember.length>0? group.group.groupMember[0].name : "No Group Member Yet"} <br /> {group.group.groupMember[0]?.rollNo}
              </h5>
              <h5>{group.group.myDetail[0].name} <br /> {group.group.myDetail[0].rollNo}</h5>
            </div>

            <div className="last">
              <div className="review-box">
                <div>
                  <h6>Review</h6>
                  <div class="form-floating">
                    <textarea class="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
                  </div>
                </div>
                <div>
                  <a href="">view uploaded document</a>
                </div>
              </div><div className="review-box">
                <div>
                  <h6>Review</h6>
                  <div class="form-floating">
                    <textarea class="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
                  </div>
                </div>
                <div>
                  <a href="">view uploaded document</a>
                </div>
              </div>
            </div>
            <div className="upload-btn">
              <button className="btn btn-danger">Upload Document</button>
            </div>
          </> : <h1 className='text-center my-4'>You're currently not enrolled in any Group.</h1>
        }
      </div> : <Loading />
      }
    </div>
  )
}

export default MyGroup