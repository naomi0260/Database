//list events (public, rso ,private)
//list of rso 
//join rso 
//leave rso 
//comment and rate event 
//req to make rso 
//req to make public event as a admin of a rso 
//admin - CRUD events for rso , also can make private events to uni, Update RSO 

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // You can use axios for making API requests

const StudentPage = () => {
  const [publicEvents, setPublicEvents] = useState([]);
  const [privateEvents, setPrivateEvents] = useState([]);
  const [rsoEvents, setRsoEvents] = useState([]);

  useEffect(() => {
    // Fetch public events
    axios.get('/api/public-events')
      .then((response) => setPublicEvents(response.data))
      .catch((error) => console.error('Error fetching public events:', error));

    // Fetch private events for the student's university
    axios.get('/api/private-events')
      .then((response) => setPrivateEvents(response.data))
      .catch((error) => console.error('Error fetching private events:', error));

    // Fetch RSO events for the student
    axios.get('/api/rso-events')
      .then((response) => setRsoEvents(response.data))
      .catch((error) => console.error('Error fetching RSO events:', error));
  }, []);

  return (
    <div>
      <h1>Student Page</h1>
      <h2>Public Events</h2>
      <ul>
        {publicEvents.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>

      <h2>Private Events</h2>
      <ul>
        {privateEvents.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>

      <h2>RSO Events</h2>
      <ul>
        {rsoEvents.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudentPage;
