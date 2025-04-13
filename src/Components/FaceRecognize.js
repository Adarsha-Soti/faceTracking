import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import employees from './employees.json'; 

const FaceRecognize = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [employeeData, setEmployeeData] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.loadFaceLandmarkModel('/models'),
        faceapi.loadFaceRecognitionModel('/models')
      ]);
      setInitialized(true);
    } catch (error) {
      console.error('Model loading failed:', error);
    }
  }, []);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
    }
  }, []);

  const processEmployeePhotos = useCallback(async () => {
    const processedEmployees = await Promise.all(
      employees.employees.map(async (employee) => {
        try {
          const image = await faceapi.fetchImage(employee.picture);
          const detection = await faceapi
            .detectSingleFace(image)
            .withFaceLandmarks()
            .withFaceDescriptor();
            
          return {
            ...employee,
            descriptor: detection?.descriptor
          };
        } catch (error) {
          console.error(`Error processing image for ${employee.fullName}:`, error);
          return null;
        }
      })
    );

    setEmployeeData(processedEmployees.filter(e => e !== null));
  }, []);

  const checkForMatches = useCallback(async () => {
    if (!initialized || employeeData.length === 0) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const displaySize = { width: 640, height: 480 };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

        detections.forEach(detection => {
          employeeData.forEach(employee => {
            if (employee.descriptor) {
              const distance = faceapi.euclideanDistance(
                detection.descriptor, 
                employee.descriptor
              );
              
              if (distance < 0.6) {
                console.log('Match found:', {
                  ...employee,
                  distance: distance.toFixed(4),
                  isActive: true
                });
                setActiveEmployee(employee);
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [initialized, employeeData]);

  useEffect(() => {
    tf.setBackend('webgl').then(() => {
      loadModels()
        .then(startVideo)
        .then(processEmployeePhotos);
    });

    const interval = setInterval(checkForMatches, 1000);
    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [loadModels, startVideo, checkForMatches, processEmployeePhotos]);

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          width="640" 
          height="480" 
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
          width="640"
          height="480"
        />
      </div>
      
      {activeEmployee && (
        <div>
          <h3>Employee Detected: ✅</h3>
          <p>Name: {activeEmployee.fullName}</p>
          <p>ID: {activeEmployee.id}</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h4>Registered Employees:</h4>
        <ul>
          {employeeData.map(employee => (
            <li key={employee.id}>
              {employee.fullName} - {employee.isActive ? 'Active' : 'Inactive'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FaceRecognize;