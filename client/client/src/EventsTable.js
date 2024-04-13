import React, { useState, useContext } from 'react';
import Modal from 'react-modal'; // or your Modal component
import { useUser } from './userContext';

const EventsTable = ({ events, title}) => {
  const { user } = useUser(); // Get the user from your UserContext

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [comments, setComments] = useState([]); // Define comments and setComments

  const openModal = (event) => {
    setSelectedEvent(event);
    fetchComments(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setComments([]);
    setModalOpen(false);
  };

  const fetchComments = async (event) => {
    try {
      const response = await fetch(`http://localhost:5010/api/events/${event.EventID}/comments-ratings`);
  
      if (!response.ok) {
        throw new Error('Error fetching comments and ratings');
      }
  
      const commentsRatings = await response.json();
      console.log("coments", commentsRatings);
      setComments(commentsRatings);
    } catch (error) {
      alert(error.message);
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    const formattedTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return formattedTime;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch(`http://localhost:5010/api/events/${selectedEvent.EventID}/comments-ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId,
          commentText: comment,
          rating: rating,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.message);
        setComment('');
        setRating('');
        // Fetch the comments again after adding a comment
        fetchComments();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error adding comment and/or rating');
    }
  };


  return (
    <>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
        {console.log(events)}
          {events.length > 0 ? (
            events.map((event, index) => (
              <tr key={index} onClick={() => openModal(event)}>
                <td>{event.Name}</td>
                <td>{event.Location}</td>
                <td>{new Date(event.Date).toLocaleDateString()}</td>
                <td>{formatTime(event.Time)}</td>
                {/* Add more cells as needed */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>No events available.</td>
            </tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <Modal isOpen={modalOpen} onRequestClose={closeModal}>
        <h2>{selectedEvent.Name}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Comment:
            <input type="text" value={comment} onChange={e => setComment(e.target.value)} />
          </label>
          <label>
            Rating:
            <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <div>
          {comments.map((comment, index) => (
            <div key={index}>
              <p>{comment.CommentText}, Rating: {comment.Rating}</p>
            </div>
          ))}
        </div>
      </Modal>
      )}
    </>
  );
};

export default EventsTable;