import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Login';
import StudentPage from './Student';
import RegisterPage from './Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentPage />} /> {/* New student route */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Define other routes here */}
      </Routes>
    </Router>
  );
}

export default App;