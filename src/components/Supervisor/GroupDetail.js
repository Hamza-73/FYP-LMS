import React, { useEffect, useState } from 'react'

const GroupDetail = () => {
    const [group, setGroup] = useState({groups:[]})
    const getGroup = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/supervisor/my-groups', {
            method: 'GET',
            headers: {
              'Content-Type': 'appication/json',
              authorization: `${token}`
            }
          });
          const json = await response.json();
          console.log('json is ', json);
          setGroup(json);
    
        } catch (error) {
          console.log('error is in groupDetail ', error);
        }
      }
    
      useEffect(() => {
        getGroup();
      }, [])
    
    return (
        <div>
            <div className="container">

                <div className="upperpart">
                    <div className="proj-detail d-flex justify-content-between">
                        <h4>Project Title</h4>
                        {/* <h5>{group.groups[0].projects[0].projectTitle}</h5> */}
                    </div>
                    <div className="proj-detail d-flex justify-content-between">
                        <h4>Supervisor</h4>
                        {/* <h5>{group.groups[0].supervisor}</h5> */}
                    </div>
                </div>


                <div className="mid">
                    {/* <h5>{group.groups[0].supervisor}</h5>
                    <h5>{group.groups[0].projects[0].students[0].name} <br /> {group.groups[0].projects[0].students[0].rollNo}</h5>
                    <h5>{group.groups[0].projects[0].students[1].name} <br /> {group.groups[0].projects[0].students[1].rollNo}</h5> */}
                    <h5>Supr</h5>
                    <h5>Group1</h5>
                    <h5>Group2</h5>
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

            </div>
        </div>
    )
}

export default GroupDetail
