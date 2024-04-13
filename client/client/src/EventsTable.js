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
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [editedCommentRating, setEditedCommentRating] = useState('');

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

  const handleEdit = (commentId, commentText, commentRating) => {

    console.log("Handle edit",commentId, commentText, commentRating);
    setEditingCommentId(commentId);
    setEditedCommentText(commentText);
    setEditedCommentRating(commentRating);
  };

  const handleDelete = async (eventId, commentId) => {
    try {
      const response = await fetch(`http://localhost:5010/api/events/${eventId}/comments-ratings/${commentId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error deleting comment');
      }
  
      // Remove the deleted comment from the state
      setComments(comments.filter(comment => comment.id !== commentId));
      fetchComments(eventId);
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchComments = async (event) => {
    try {
      const response = await fetch(`http://localhost:5010/api/events/${event.EventID}/comments-ratings`);
  
      if (!response.ok) {
        throw new Error('Error fetching comments and ratings');
      }
  
      const commentsRatings = await response.json();
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

  const handleSave = async (selectedEvent) => {

    console.log("Handle save",editedCommentText, editedCommentRating);
    try {
      const response = await fetch(`http://localhost:5010/api/events/${selectedEvent.EventID}/comments-ratings/${editingCommentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentText: editedCommentText, rating: editedCommentRating }),
      });
  
      if (!response.ok) {
        throw new Error('Error updating comment');
      }
  
      // Update the comment in the state
      setComments(comments.map(comment => comment.id === editingCommentId ? { ...comment, CommentText: editedCommentText, Rating: editedCommentRating } : comment));
  
      // Reset editingCommentId, editedCommentText, and editedCommentRating
      setEditingCommentId(null);
      setEditedCommentText('');
      setEditedCommentRating('');
      fetchComments(selectedEvent);
    } catch (error) {
      alert(error.message);
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
      {editingCommentId === comment.CommentID ? (
            <div>
              <input type="text" value={editedCommentText} onChange={e => setEditedCommentText(e.target.value)} />
              <input type="number" value={editedCommentRating} onChange={e => setEditedCommentRating(e.target.value)} />
              <button onClick={() => handleSave(selectedEvent)}>Save</button>
            </div>
          ) : (
            <div>
              <p>{comment.CommentText}, Rating: {comment.Rating}</p>
              <button onClick={() => handleEdit(comment.CommentID, comment.CommentText, comment.Rating)}>Edit</button>
              <button onClick={() => handleDelete(selectedEvent.EventID, comment.CommentID)}>Delete</button>
            </div>
          )}
              </div>
          ))}
        </div>
      </Modal>
      )}
    </>
  );
};

export default EventsTable;