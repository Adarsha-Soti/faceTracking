import { Routes, Route } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import Authenticated from './Components/Authenticated';
import './App.css';

function App() {
  return (
    <Routes>
      <Route index element={<Authenticated />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;