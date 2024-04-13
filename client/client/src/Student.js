
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useUser } from './userContext';
import { useNavigate } from 'react-router-dom';
import EventsTable from './EventsTable';

const StudentPage = () => {
  const [publicEvents, setPublicEvents] = useState([]);
  const [privateEvents, setPrivateEvents] = useState([]);
  const [rsoEvents, setRsoEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [universities, setUniversities] = useState([]);
  const [rsos, setRsosId] = useState([]);
  const [rsoId, setRsoId] = useState('');
  const [selectedEmailDomain, setSelectedEmailDomain] = useState('');
  const [joinModalIsOpen, setJoinModalIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listOfMembers, setListOfMembers] = useState([]);
  const [rsoList, setRsoList] = useState([]);
  const { user } = useUser();
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
  const [createRsoEventModalIsOpen, setCreateRsoEventModalIsOpen] = useState(false);
  const [rsoEventName, setRsoEventName] = useState('');
  const [rsoEventDescription, setRsoEventDescription] = useState('');
  const [rsoEventTime, setRsoEventTime] = useState('');
  const [rsoEventDate, setRsoEventDate] = useState('');
  const [rsoEventLocation, setRsoEventLocation] = useState('');
  const [rsoEventContactPhone, setRsoEventContactPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    const emails = event.target.value.split(',').map(email => email.trim());
    setListOfMembers(emails);
  };

  useEffect(() => {
    // Fetch public events
    axios.get('http://localhost:5010/api/events/public')
      .then((response) => {
        setPublicEvents(response.data);
      })
      .catch((error) => console.error('Error fetching public events:', error));

    // Fetch private events for the student's university
    if (user) {
      axios.get(`http://localhost:5010/api/events/private/uni?universityId=${user.universityId}`)
        .then((response) => setPrivateEvents(response.data))
        .catch((error) => console.error('Error fetching private events:', error));

      const universityId = user.universityId;
      // Fetch RSOs for the student's university
      axios.get('http://localhost:5010/api/listrsos', { params: { universityId } })
        .then((response) => setRsoList(response.data))
        .catch((error) => console.error('Error fetching RSOs:', error));
        console.log('RSO List:', rsoList);

      // Fetch RSO events for the student
      axios.get(`http://localhost:5010/api/events/private/rso?userId=${user.userId}`)
        .then((response) => setRsoEvents(response.data))
        .catch((error) => console.error('Error fetching RSO events:', error));
      
        checkUserType(user);
    }
    console.log('Public Events:', publicEvents);
    console.log('Private Events:', privateEvents);

  }, [user]);


  const checkUserType = (user) => {
    if(user.userType === 'admin'){
      setIsAdmin(true);
    }
  }

  const checkIfUserIsAdmin = async (userId, rsoId) => {
    console.log('Checking if user is admin:', userId, rsoId);
    try {
      const response = await fetch(`http://localhost:5010/api/isadmin/${userId}/${rsoId}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      console.log('Data:', data);
      if (data.isAdmin) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  };

  const handleRSOChange = (e) => {
    const id = e.target.value;
    const selectedRSO = rsoList.find(rso => rso.Name === id);
    if (selectedRSO) {
      setSelectedRSO(selectedRSO);
    }
  };

  const handleEventTypeChange = (event) => {
    setEventType(event.target.value);
  };

  const handleEventRSOChange = (event) => {
    console.log('Selected RSO:', event.target.value);
    const id = event.target.value;
    const selectedRSO = rsoList.find(rso => rso.Name === id);
    if (selectedRSO) {
      setSelectedRSO(selectedRSO);
    }
  };

  function renderButton() {
    if (isAdmin) {
      return <button onClick={() => setCreateRsoEventModalIsOpen(true)}>Add RSO Event</button>;
    } else {
      return null;
    }
  }

  const submitRSORequest = () => {

    if (!user) {
      alert('You must be logged in to submit an RSO creation request.');
      return;
    }

    axios.post('http://localhost:5010/api/rsos/request', {
      universityId: user.universityId,
      name,
      description,
      requestedBy: user.userId,
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
    
    axios.post(`http://localhost:5010/api/rsos/${selectedRSO.RSOID}/users`, {
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

  const leaveRSO = async (rsoId, userId) => {
    try {
      const response = await fetch(`http://localhost:5010/api/rsos/${rsoId}/users/${userId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error leaving RSO');
      }
  
      // Handle successful leave
      alert('You have successfully left the RSO');
    } catch (error) {
      alert(error.message);
    }
  };

  const createEvent = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/events/public', {
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
          contactEmail: user.userEmail,
          eventCategoryID: 'public',
          universityID: user.universityId,
          madeBy: user.userId,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.message);
        setCreateEventModalIsOpen(false);
        axios.get('http://localhost:5010/api/events/public')
          .then((response) => {
            setPublicEvents(response.data);
          })
          .catch((error) => console.error('Error fetching public events:', error));
          
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error creating event');
    }
  };

  const createRsoEvent = async () => {
    let visibilityToUniversity = false;
    let visibilityToRSO = false;
    let eventID = '';
    if (eventType === '1') {
      visibilityToUniversity = true;
      eventID = 'university';
    }else if (eventType === '2') {
      visibilityToRSO = true;
      eventID = 'rso';
    }

    const isUserAdmin = await checkIfUserIsAdmin(user.userId, selectedRSO.RSOID);
    if (!isUserAdmin) {
      alert('You must be an admin of the RSO to create an event.');
      return;
    }

    console.log('event: ', eventID)
    try {
      const response = await fetch('http://localhost:5010/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: rsoEventName,
          description: rsoEventDescription,
          time: rsoEventTime,
          date: rsoEventDate,
          location: rsoEventLocation,
          contactPhone: rsoEventContactPhone,
          contactEmail: user.userEmail,
          eventCategoryID: eventID,
          rsoId: selectedRSO.RSOID,
          isVisibleToUniversity: visibilityToUniversity,
          isVisibleToRSO: visibilityToRSO,
          madeBy: user.userId,
          universityId: user.universityId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      axios.get(`http://localhost:5010/api/events/private/uni?universityId=${user.universityId}`)
        .then((response) => setPrivateEvents(response.data))
        .catch((error) => console.error('Error fetching private events:', error));

      axios.get(`http://localhost:5010/api/events/private/rso?userId=${user.userId}`)
        .then((response) => setRsoEvents(response.data))
        .catch((error) => console.error('Error fetching RSO events:', error));
      
    } catch (error) {
      console.error('Error creating RSO event:', error);
    }
  };

  return (
    <div>
      <button onClick={() => setModalIsOpen(true)}>Create RSO</button>

      <button onClick={() => setJoinModalIsOpen(true)}>Join/Leave RSO</button>

      <button onClick={() => setCreateEventModalIsOpen(true)}>Create Event</button>

      {renderButton()}

      <button onClick={() => navigate(`/`)}> Logout </button>

      <Modal isOpen={createEventModalIsOpen} onRequestClose={() => setCreateEventModalIsOpen(false)}>
        <h2>Create Event</h2>
        <input type="text" placeholder="Name" onChange={e => setEventName(e.target.value)} />
        <input type="text" placeholder="Description" onChange={e => setEventDescription(e.target.value)} />
        <input type="time" onChange={e => setEventTime(e.target.value)} />
        <input type="date" onChange={e => setEventDate(e.target.value)} />
        <input type="text" placeholder="Location" onChange={e => setEventLocation(e.target.value)} />
        <input type="text" placeholder="Contact Phone" onChange={e => setEventContactPhone(e.target.value)} />
        <button onClick={createEvent}>Create</button>
      </Modal>

      <Modal isOpen={createRsoEventModalIsOpen} onRequestClose={() => setCreateRsoEventModalIsOpen(false)}>
        <h2>Create RSO Event</h2>
        <input type="text" placeholder="Name" onChange={e => setRsoEventName(e.target.value)} />
        <input type="text" placeholder="Description" onChange={e => setRsoEventDescription(e.target.value)} />
        <input type="time" onChange={e => setRsoEventTime(e.target.value)} />
        <input type="date" onChange={e => setRsoEventDate(e.target.value)} />
        <input type="text" placeholder="Location" onChange={e => setRsoEventLocation(e.target.value)} />
        <input type="text" placeholder="Contact Phone" onChange={e => setRsoEventContactPhone(e.target.value)} />
        <select name="event-type" id="event-type" value={eventType} onChange={handleEventTypeChange}>
          <option value="">--Open to:--</option>
          <option value="1">University</option>
          <option value="2">RSO</option>
        </select>
        <label>
          RSO:
          <select value={rsoId} onChange={handleEventRSOChange} required>
            <option value="">Select RSO</option>
            {rsoList.map((rso) => (
              <option key={rso.rsoId} value={rso.rsoId}>
                {rso.Name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={createRsoEvent}>Create</button>
      </Modal>

      <Modal isOpen={joinModalIsOpen} onRequestClose={() => setJoinModalIsOpen(false)}>
        <h2>Join/Leave RSO</h2>
        <label>
          RSO:
          <select value={rsoId} onChange={handleRSOChange} required>
            <option value="">Select RSO</option>
            {rsoList.map((rso) => (
              <option key={rso.rsoId} value={rso.rsoId}>
                {rso.Name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={joinRSO}>Join</button>

        <label>
          RSO:
          <select value={rsoId} onChange={handleRSOChange} required>
            <option value="">Select RSO</option>
            {rsoList.map((rso) => (
              <option key={rso.rsoId} value={rso.rsoId}>
                {rso.Name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={()=> leaveRSO(selectedRSO.RSOID, user.userId)}>Leave</button>
        
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
      <EventsTable events={publicEvents} title="Public Events" />
      <EventsTable events={privateEvents} title="Private Events" />
      <EventsTable events={rsoEvents} title="RSO Events" />
    </div>
  );
};

export default StudentPage;
