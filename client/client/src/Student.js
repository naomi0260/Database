//list events (public, rso ,private)
//list of rso 
//join rso 
//leave rso 
//comment and rate event 
//req to make rso 
//req to make public event as a admin of a rso, only a already made event can be requested 
// for example a private uni event or/and a private rso event  
//admin - CRUD events for rso , also can make private events to uni, Update RSO 

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useUser } from './userContext';

const StudentPage = () => {
  const [publicEvents, setPublicEvents] = useState([]);
  const [privateEvents, setPrivateEvents] = useState([]);
  const [rsoEvents, setRsoEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [universities, setUniversities] = useState([]);
  const [rsos, setRsosId] = useState([]);
  const [rsoId, setRsoId] = useState('');
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('');
  const [joinModalIsOpen, setJoinModalIsOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [listOfMembers, setListOfMembers] = useState([]);
  const [rsoList, setRsoList] = useState([]);
  const { user, setUser } = useUser();
  const [selectedRSO, setSelectedRSO] = useState(null);
  const [createEventModalIsOpen, setCreateEventModalIsOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventContactPhone, setEventContactPhone] = useState('');
  const [eventContactEmail, setEventContactEmail] = useState('');
  const [eventCategoryID, setEventCategoryID] = useState('');
  const [eventUniversityID, setEventUniversityID] = useState('');
  const [eventMadeBy, setEventMadeBy] = useState('');



  const handleEmailChange = (event) => {
    const emails = event.target.value.split(',').map(email => email.trim());
    setListOfMembers(emails);
  };

  useEffect(() => {
    // Fetch public events
    axios.get('http://localhost:5010/api/events/public')
      .then((response) => setPublicEvents(response.data))
      .catch((error) => console.error('Error fetching public events:', error));

    // Fetch private events for the student's university
    axios.get('http://localhost:5010/api/events/private/uni?universityId=${user.universityId}')
      .then((response) => setPrivateEvents(response.data))
      .catch((error) => console.error('Error fetching private events:', error));

    // Fetch RSO events for the student
    axios.get('http://localhost:5010/api/events/private/rso')
      .then((response) => setRsoEvents(response.data))
      .catch((error) => console.error('Error fetching RSO events:', error));

    // Fetch RSOs for the student's university
    if (user) {
      const universityId = user.universityId;
      axios.get('http://localhost:5010/api/listrsos', { params: { universityId } })
        .then((response) => setRsoList(response.data))
        .catch((error) => console.error('Error fetching RSOs:', error));
    }

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
  }, [user]);

  const handleUniversityChange = (e) => {
    const id = e.target.value;
    setUniversityId(id);
    const selectedUniversity = universities.find(u => u.UniversityID.toString() === id);
    if (selectedUniversity) {
      setSelectedEmailDomain(selectedUniversity.EmailDomain);
    }
  };

  const handleRSOChange = (e) => {
    const id = e.target.value;
    const selectedRSO = rsoList.find(rso => rso.RSOID.toString() === id);
    if (selectedRSO) {
      setSelectedRSO(selectedRSO);
    }
  };

  const submitRSORequest = () => {
    axios.post('http://localhost:5010/api/rsos/request', {
      user: user.universityId,
      name,
      description,
      requestedBy,
      listOfMembers
    })
    .then(() => {
      alert('RSO creation request submitted successfully.');
      setModalIsOpen(false);
    })
    .catch((error) => {
      alert('Error submitting RSO creation request: ' + error.message);
    });
  };

  const joinRSO = () => {
    if(user.usertype === 'admin'){
      setIsAdmin(true);
    }else{
      setIsAdmin(false);
    }
    
    axios.post(`http://localhost:5010/api/rsos/${rsoId}/users`, {
      userId: user.userId,
      isAdmin
    })
    .then(() => {
      alert('User added to RSO successfully');
      setJoinModalIsOpen(false);
    })
    .catch((error) => {
      alert('Error adding user to RSO: ' + error.message);
    });
  };

  const createEvent = async () => {
    try {
      const response = await fetch('/api/events/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventName,
          description: eventDescription,
          time: eventTime,
          date: eventDate,
          location: eventLocation,
          contactPhone: eventContactPhone,
          contactEmail: eventContactEmail,
          eventCategoryID: 'public',
          universityID: user.universityId,
          madeBy: eventMadeBy,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.message);
        setCreateEventModalIsOpen(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error creating event');
    }
  };

  return (
    <div>
      <button onClick={() => setModalIsOpen(true)}>Create RSO</button>

      <button onClick={() => setJoinModalIsOpen(true)}>Join RSO</button>

      <button onClick={() => setCreateEventModalIsOpen(true)}>Create Event</button>

      <Modal isOpen={createEventModalIsOpen} onRequestClose={() => setCreateEventModalIsOpen(false)}>
        <h2>Create Event</h2>
        <input type="text" placeholder="Name" onChange={e => setEventName(e.target.value)} />
        <input type="text" placeholder="Description" onChange={e => setEventDescription(e.target.value)} />
        <input type="text" placeholder="Time" onChange={e => setEventTime(e.target.value)} />
        <input type="text" placeholder="Date" onChange={e => setEventDate(e.target.value)} />
        <input type="text" placeholder="Location" onChange={e => setEventLocation(e.target.value)} />
        <input type="text" placeholder="Contact Phone" onChange={e => setEventContactPhone(e.target.value)} />
        <input type="text" placeholder="Contact Email" onChange={e => setEventContactEmail(e.target.value)} />
        <input type="text" placeholder="Made By" onChange={e => setEventMadeBy(e.target.value)} />
        <button onClick={createEvent}>Create</button>
      </Modal>

      <Modal isOpen={joinModalIsOpen} onRequestClose={() => setJoinModalIsOpen(false)}>
        <h2>Join RSO</h2>
        <label>
          RSO:
          <select value={rsoId} onChange={handleRSOChange} required>
            <option value="">Select RSO</option>
            {rsos.map((rso) => (
              <option key={rso.rsoID} value={rso.rsoID}>
                {rso.Name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={joinRSO}>Join</button>
      </Modal>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Create RSO</h2>
        <input type="text" placeholder="Name" onChange={e => setName(e.target.value)} />
        <input type="text" placeholder="Description" onChange={e => setDescription(e.target.value)} />
            <input
            type="text"
            placeholder="List of Members (separate emails with commas)"
            onChange={handleEmailChange}
          />
        <button onClick={submitRSORequest}>Submit</button>
      </Modal>

      <h1>Student Page</h1>
      <h2>Public Events</h2>
      <ul>
          {publicEvents.length > 0 ? (
            publicEvents.map((event) => (
              <li key={event.id}>{event.name}</li>
            ))
          ) : (
            <li>No public events available.</li>
          )}
      </ul>

      <h2>Private Events</h2>
      <ul>
        {privateEvents.length > 0 ? (
          privateEvents.map((event) => (
            <li key={event.id}>{event.name}</li>
          ))
        ) : (
          <li>No private events available.</li>
        )}
      </ul>
      <h2>RSO Events</h2>
      <ul>
        {rsoEvents.length > 0 ? (
          rsoEvents.map((event) => (
            <li key={event.id}>{event.name}</li>
          ))
        ) : (
          <li>No RSO events available.</li>
        )}
      </ul>
    </div>
  );
};

export default StudentPage;
