import React, { useEffect, useState } from 'react';
import Loading from '../Loading';

const GroupDetail = () => {
  const [group, setGroup] = useState({
    groups: [
      {
        projects: [
          {
            projectTitle: '',
            students: [  { name: '', rollNo: '', userId: '', _id: '', }, { name: '', rollNo: '', userId: '', _id: '', },
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
          authorization: `${token}`,
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

  const currentGroup = group.groups[currentIndex] || {};

  return (
    <div>
      {!loading ? (
        <div className="container">
          <div className="upperpart">
            <div className="proj-detail d-flex justify-content-between">
              <h4>Project Title</h4>
              <h5>{currentGroup.projects[0]?.projectTitle || 'N/A'}</h5>
            </div>
            <div className="proj-detail d-flex justify-content-between">
              <h4>Supervisor</h4>
              <h5>{currentGroup.supervisor || 'N/A'}</h5>
            </div>
          </div>

          <div className="mid">
            {currentGroup.projects[0]?.students.map((student, index) => (
              <div key={index}>
                <h5>
                  {student.name} <br /> {student.rollNo}
                </h5>
              </div>
            ))}
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
                <a href="">view uploaded document</a>
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
                <a href="">view uploaded document</a>
              </div>
            </div>
          </div>

          <div className="upload-btn">
            <button className="btn btn-danger">Upload Document</button>
          </div>

          <button
            className="btn btn-success"
            onClick={handlePrevClick}
            disabled={currentIndex <=0 }
          >
            Prev
          </button><button
            className="btn btn-success"
            onClick={handleNextClick}
            disabled={currentIndex === group.groups.length - 1}
          >
            Next
          </button>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default GroupDetail;
