import React, { useState } from 'react'
import SideBar from '../SideBar'
import '../../css/task.css'
import axios from 'axios';
import { FormDataEncoder } from 'form-data-encoder';

const Tasks = (props) => {
  const [file, setFile] = useState();

  const upload = async () => {
    try {
      if (!file) {
        console.log('No file selected.');
        return;
      }

      const formData = new FormData();
      formData.append('proposal', file); // Make sure to match the field name with your backend route
      console.log('form data is ', formData)
      // Use form-data-encoder to encode the formData// Create an instance of FormDataEncoder
      const encoder = new FormDataEncoder(formData);

      // Use the encoder to encode the formData
      const encodedFormData = encoder.encode();

      const response = await fetch('http://localhost:5000/student/proposal', {
        method: "POST",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${encodedFormData.boundary}`,
          "Authorization": localStorage.getItem('token')
        },
        body: encodedFormData.body,
      });

      if (response.status === 201) {
        console.log('PDF uploaded successfully');
        // You can update your UI here or show a success message to the user
      } else {
        console.log('Failed to upload PDF');
        // Handle the error or show an error message to the user
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      // Handle the error or show an error message to the user
    }
  };
  return (
    <div>
      <div className="container">
        <div className="upper">
          <h1>Task Submission</h1>
          <h4>Instructions:</h4>
          <h6>Project Proposal</h6>
          <h6>Submit PDF Only, max size should be 3MB</h6>
        </div>
        <div className="last">
          <div className="boxes d-flex justify-content-evenly">
            <div>Submission Status</div>
            <div>Submitted/Pending</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <div>Due Date</div>
            <div>Thursday 28, November 2023</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <div>Grading Status</div>
            <div>Graded/NotGraded</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <div>Time Remaining</div>
            <div>Task Submitted Late</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <input type="file" onChange={(e) => { setFile(e.target.files[0]); console.log(e.target.files[0]) }} name='proposal' />
            <button className='btn' type='button' style={{ color: "white", fontWeight: "600" }} onClick={upload}>Add Submission</button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Tasks
