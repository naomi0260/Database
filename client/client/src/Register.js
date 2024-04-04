import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:5010/api/listuniversities');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUniversities(data.universities);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };

    fetchUniversities();
  }, []);

  const handleUniversityChange = (e) => {
    const id = e.target.value;
    setUniversityId(id);
    const selectedUniversity = universities.find(u => u.UniversityID.toString() === id);
    if (selectedUniversity) {
      setSelectedEmailDomain(selectedUniversity.EmailDomain);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const userEmailDomain = email.substring(email.lastIndexOf("@"));
    if (selectedEmailDomain && userEmailDomain !== selectedEmailDomain) {
      alert(`Your email domain must match the selected university's domain (${selectedEmailDomain}).`);
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5010/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          universityId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data.message);
      alert(data.message); // Show success message
    } catch (error) {
      console.error('Error:', error);
      alert('Error during registration. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
        <label>
          Confirm Password:
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /> 
        </label>
        <br />
        <label>
          University:
          <select value={universityId} onChange={handleUniversityChange} required>
            <option value="">Select University</option>
            {universities.map((uni) => (
              <option key={uni.UniversityID} value={uni.UniversityID}>
                {uni.Name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <input type="submit" value="Register" />
      </form>
      <p>
        Return to <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Register;
