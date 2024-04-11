import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from './userContext';

function Login() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { user, setUser} = useUser();

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('http://localhost:5010/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Data:', data);
        console.log('setUser function:', setUser);
        setUser({
          userId: data.userId,
          universityId: data.UniversityID,
          userEmail: email,
          userType: data.UserType,
        });
        console.log('User after setUser:', user);
        if (data.UserType === 'student' || data.UserType === 'admin') {
    
         navigate(`/student/${data.userId}/${data.UniversityID}`);
        } else if (data.UserType === 'super_admin') {
   
         navigate(`/superadmin/${data.userId}`);
        } else {
    
          alert('error user');
        } 
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Invalid email or password'); 
      });
  };

  return (
    <div>
      <h2>Welcome to University Events!</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email: 
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <br />
        <input type="submit" value="Login" />
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
