import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import StudentPage from './Student';
import Register from './Register';
import SuperAdmin from './SuperAdmin';
import { UserProvider } from './userContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/student/:userId/:universityId" element={<StudentPage />} />
          <Route path="/superadmin/:userId" element={<SuperAdmin />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;