import React, { useState } from 'react';
import Modal from 'react-modal'; // or your Modal component

const EventsTable = ({ events, title }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setModalOpen(false);
  };

  return (
    <>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody>
          {events.length > 0 ? (
            events.map((event, index) => (
              <tr key={index} onClick={() => openModal(event)}>
                <td>{event.name}</td>
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
          {/* Display selectedEvent details, comments, ratings, etc. */}
        </Modal>
      )}
    </>
  );
};

export default EventsTable;