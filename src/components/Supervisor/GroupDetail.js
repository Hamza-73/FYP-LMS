import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import SideBar from '../SideBar';

const GroupDetail = () => {
  const [group, setGroup] = useState({
    groups: [
      {
        projects: [
          {
            projectTitle: '',
            students: [ { name: '', rollNo: '', userId: '', _id: '' }, { name: '', rollNo: '', userId: '', _id: '' },
            ],
          },
        ],
      },
    ],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const getGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      const response = await fetch('http://localhost:5000/supervisor/my-groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      const json = await response.json();
      console.log('json is ', json);
      setGroup(json);
      setLoading(false);
    } catch (error) {
      console.log('error is in groupDetail ', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getGroup();
    }, 2000);
  }, []);

  const handleNextClick = () => {
    // Increment the currentIndex to show the details of the next group
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };
  const handlePrevClick = () => {
    // Increment the currentIndex to show the details of the next group
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  const currentGroup = group.groups.length>0 ? group.groups[currentIndex] :  {};

  return (
    <div>
      {!loading ? (
        <>
          {group.groups.length > 0 ? (
            <div className="container">
              <div className="upperpart">
                <div className="proj-detail d-flex justify-content-between">
                  <h4>Project Title</h4>
                  <h5>{currentGroup.projects[0].projectTitle || 'N/A'}</h5>
                </div>
                <div className="proj-detail d-flex justify-content-between">
                  <h4>Supervisor</h4>
                  <h5>{currentGroup.supervisor || 'N/A'}</h5>
                </div>
              </div>

              <div className="mid">
                
                  <div>
                    <h5>
                      {currentGroup.projects[0].students[0]? currentGroup.projects[0].students[0].name:"No Student Yet"} <br /> {currentGroup.projects[0].students[0]? currentGroup.projects[0].students[0].rollNo:""}
                    </h5>
                    </div>
                    <div>
                    <h5>
                      {currentGroup.projects[0].students[1]? currentGroup.projects[0].students[1].name:"No Student Yet"} <br /> {currentGroup.projects[0].students[1]? currentGroup.projects[0].students[1].rollNo:""}
                    </h5>
                  </div>
               
              </div>

              <div className="last">
                <div className="review-box">
                  <div>
                    <h6>Review</h6>
                    <div className="form-floating">
                      <textarea className="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
                    </div>
                  </div>
                  <div>
                    <a href="">View uploaded document</a>
                  </div>
                </div>
                <div className="review-box">
                  <div>
                    <h6>Review</h6>
                    <div className="form-floating">
                      <textarea className="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
                    </div>
                  </div>
                  <div>
                    <a href="">View uploaded document</a>
                  </div>
                </div>
              </div>

              <div className="upload-btn">
                <button className="btn btn-danger">Upload Document</button>
              </div>

              <button
                className="btn btn-success"
                onClick={handlePrevClick}
                disabled={currentIndex <= 0}
              >
                Prev
              </button>
              <button
                className="btn btn-success"
                onClick={handleNextClick}
                disabled={currentIndex === group.groups.length - 1}
              >
                Next
              </button>
            </div>
          ) : (
              <h2 className='text-center'>You currently have no group in supervision.</h2>
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default GroupDetail;
