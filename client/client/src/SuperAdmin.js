import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [universityName, setUniversityName] = useState('');
  const [universityLocation, setUniversityLocation] = useState('');
  const [universityDescription, setUniversityDescription] = useState('');
  const [universityNumberOfStudents, setUniversityNumberOfStudents] = useState('');
  const [universityEmailDomain, setUniversityEmailDomain] = useState('');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingRSORequests, setPendingRSORequests] = useState([]);
  const navigate = useNavigate();
  
  

  useEffect(() => {
    fetchUsers();
    fetchUniversities();
    fetchPendingEvents();
    fetchPendingRSORequests();
  }, []);

  const fetchPendingRSORequests = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/rsos/pendingrequests');
      if (response.ok) {
        const data = await response.json();
        
        setPendingRSORequests(data.pendingRequests || []);
      } else {
        
        console.error('Failed to fetch pending RSO requests:', response.statusText);
        setPendingRSORequests([]);
      }
    } catch (error) {
      
      console.error('Error fetching pending RSO requests:', error);
      setPendingRSORequests([]); 
    }
  };
  

  

  const approveRSORequest = async (requestId) => {
    const response = await fetch(`http://localhost:5010/api/rsos/requests/${requestId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ status: 'approved' }), 
    });
    if (response.ok) {
      fetchPendingRSORequests(); 
    } else {
       
      alert(`Failed to approve RSO request`);
    }
  };
  

  const denyRSORequest = async (requestId) => {
   
    const response = await fetch(`http://localhost:5010/api/rsos/requests/${requestId}/deny`, { method: 'PUT' });
    if (response.ok) {
      fetchPendingRSORequests();
    } else {
      alert('Failed to deny RSO request');
    }
  };

  const fetchPendingEvents = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/events/pendingrequest');
      if (response.ok) {
        const data = await response.json();
        
        setPendingEvents(data || []);
      } else {
        
        console.error('Failed to fetch pending events:', response.statusText);
        setPendingEvents([]);
      }
    } catch (error) {
      
      console.error('Error fetching pending events:', error);
      setPendingEvents([]); 
    }
  };
  

  const approveEvent = async (eventId) => {
    const response = await fetch(`http://localhost:5010/api/events/${eventId}/approve`, {
      method: 'PUT',
    });
    if (response.ok) {
      fetchPendingEvents(); 
    }
  };

  const denyEvent = async (eventId) => {
    const response = await fetch(`http://localhost:5010/api/events/${eventId}/deny`, {
      method: 'PUT',
    });
    if (response.ok) {
      fetchPendingEvents(); 
    }
  };

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5010/api/listusers');
    const data = await response.json();
    setUsers(data.users);
  };

  const fetchUniversities = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/listuniversities');
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.universities || []); 
      } else {
        console.error('Failed to fetch universities: ', response.statusText);
        setUniversities([]); 
      }
    } catch (error) {
      console.error('Error fetching universities: ', error);
      setUniversities([]); 
    }
  };
  

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5010/api/universities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: universityName,
        location: universityLocation,
        description: universityDescription,
        numberOfStudents: universityNumberOfStudents,
        emailDomain: universityEmailDomain,
      }),
    });
    if (response.ok) {
      
      setUniversityName('');
      setUniversityLocation('');
      setUniversityDescription('');
      setUniversityNumberOfStudents('');
      setUniversityEmailDomain('');
      
      fetchUniversities();
    } else {
      
      alert('Failed to create university. Please try again.');
    }
  };

  return (
    <div>
      <h1>SuperAdmin Dashboard</h1>
      <section>
        <h2>List of Universities</h2>
        <ul>
          {universities && universities.map((uni) => (
            <li key={uni.UniversityID}>{uni.Name}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Users</h2>
        <ul>
          {users && users.map((user) => (
            <li
              key={user.UserID}
            >
              {user.Email}
              
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Add a University</h2>
        <form onSubmit={handleAddUniversity}>
          <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} placeholder="University Name" required />
          <input type="text" value={universityLocation} onChange={(e) => setUniversityLocation(e.target.value)} placeholder="Location" required />
          <textarea value={universityDescription} onChange={(e) => setUniversityDescription(e.target.value)} placeholder="Description" required />
          <input type="number" value={universityNumberOfStudents} onChange={(e) => setUniversityNumberOfStudents(e.target.value)} placeholder="Number of Students" required />
          <input type="text" value={universityEmailDomain} onChange={(e) => setUniversityEmailDomain(e.target.value)} placeholder="Email Domain" required />
          <button type="submit">Add University</button>
        </form>
      </section>
      <section>
        <h2>Pending Events</h2>
        <ul>
          {pendingEvents && pendingEvents.map((event) => (
            <li key={event.EventID}>
              {event.Name} - {event.Description}
              <button onClick={() => approveEvent(event.EventID)}>Approve</button>
              <button onClick={() => denyEvent(event.EventID)}>Deny</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Pending RSO Requests</h2>
        <ul>
          {pendingRSORequests && pendingRSORequests.map((request) => (
            <li key={request.RequestID}>
              {request.Name} - {request.Description}
              <button onClick={() => approveRSORequest(request.RequestID)}>Approve</button>
              <button onClick={() => denyRSORequest(request.RequestID)}>Deny</button>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={() => navigate(`/`)}> Logout </button>

    </div>
  );
}

export default SuperAdmin;
