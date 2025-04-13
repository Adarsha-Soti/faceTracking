import React, { useState, useEffect } from 'react';
import FaceRecognize from './FaceRecognize';
import './Dashboard.css';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [detectionTimes, setDetectionTimes] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    phone: '',
    picture: '',
    boxCount: ''
  });

  useEffect(() => {
    fetch('/src/employees.json')
      .then(res => res.json())
      .then(data => setEmployees(data.employees))
      .catch(err => console.error('Error loading employees:', err));
  }, []);

  const handleFaceMatch = (matchedEmployee) => {
    if (!detectionTimes[matchedEmployee.id]) {
      setDetectionTimes(prev => ({
        ...prev,
        [matchedEmployee.id]: new Date().toLocaleString()
      }));
    }
  };

  const getImagePath = (filename) => {
    return `/reference_images/${filename}`;
  };

  const handleAddEmployee = () => {
    const newEmployee = {
      ...formData,
      picture: getImagePath(formData.picture),
      id: Date.now()
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    setOpenDialog(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="face-recognize-container">
          <FaceRecognize 
            employees={employees} 
            onFaceMatch={handleFaceMatch}
            imagePathBuilder={getImagePath}
          />
        </div>

        <div className="employee-list-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Detection Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{detectionTimes[employee.id] ? '🟢' : '⚪'}</td>
                  <td>{employee.fullName}</td>
                  <td>{detectionTimes[employee.id] || 'Not detected'}</td>
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-btn" onClick={() => setOpenDialog(true)}>
            Add Employee
          </button>
        </div>
      </div>

      {openDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Employee</h2>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
              />
            </div>
            <div className="form-group">
              <label>Photo Filename:</label>
              <input
                type="text"
                onChange={(e) => setFormData(prev => ({...prev, picture: e.target.value}))}
              />
              <small>Put image in public/reference_images first</small>
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddEmployee}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;