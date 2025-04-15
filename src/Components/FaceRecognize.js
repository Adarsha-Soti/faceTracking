import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';

const FaceRecognize = ({ employees, onFaceMatch }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [employeeData, setEmployeeData] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);

  const loadModels = useCallback(async () => {
    try {
      console.log("Loading face-api models...");
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setInitialized(true);
      console.log("Models loaded.");
    } catch (error) {
      console.error("Model loading failed:", error);
    }
  }, []);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access error:", err);
    }
  }, []);

  const processEmployeePhotos = useCallback(async () => {
    if (!employees || employees.length === 0) return;

    const processed = await Promise.all(
      employees.map(async (employee) => {
        try {
          const image = await faceapi.fetchImage(employee.picture);
          const detection = await faceapi
            .detectSingleFace(image)
            .withFaceLandmarks()
            .withFaceDescriptor();

          return detection ? { ...employee, descriptor: detection.descriptor } : null;
        } catch (error) {
          console.error(`Error processing ${employee.fullName}:`, error);
          return null;
        }
      })
    );
    setEmployeeData(processed.filter(Boolean));
  }, [employees]);

  const checkForMatches = useCallback(async () => {
    if (!initialized || employeeData.length === 0) return;

    if (!videoRef.current || videoRef.current.readyState !== 4) {
      console.warn('Video not ready for detection.');
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const displaySize = { width: 640, height: 480 };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

      detections.forEach(detection => {
        employeeData.forEach(employee => {
          if (employee.descriptor) {
            const distance = faceapi.euclideanDistance(detection.descriptor, employee.descriptor);
            if (distance < 0.6) {
              console.log("Match found:", employee.fullName, `Distance: ${distance.toFixed(4)}`);
              setActiveEmployee(employee);
              if (onFaceMatch) onFaceMatch(employee);
            }
          }
        });
      });
    } catch (error) {
      console.error("Error during face detection:", error);
    }
  }, [initialized, employeeData, onFaceMatch]);

  useEffect(() => {
    tf.ready().then(() => {
      tf.setBackend('webgl').then(() => {
        loadModels()
          .then(startVideo)
          .then(processEmployeePhotos);
      });
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
        <video ref={videoRef} autoPlay muted playsInline width="640" height="480" />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} width="640" height="480" />
      </div>

      {activeEmployee && (
        <div>
          <h3>Employee Detected ✅</h3>
          <p>Name: {activeEmployee.fullName}</p>
          <p>ID: {activeEmployee.id}</p>
        </div>
      )}
    </div>
  );
};

export default FaceRecognize;
