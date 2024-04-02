import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Login';
import StudentPage from './Student'; // Make sure to import the StudentPage component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentPage />} /> {/* New student route */}
        
        {/* Define other routes here */}
      </Routes>
    </Router>
  );
}

export default App;