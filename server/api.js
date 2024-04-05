const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');



const app = express();
app.use(cors());
require('dotenv').config();
const PORT = 5010;

const mysql = require('mysql2');
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'university_events'
  });

  function getDbConnection() {
    return db.promise();
}

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to the MySQL server.');
    
    connection.release();
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

app.use(bodyParser.json());

//student 
app.post('/api/users/register', async (req, res) => {
    const { email, password, universityId } = req.body; 

    const db = await getDbConnection();
    try {
        await db.execute('INSERT INTO User (Email, Password, UniversityID, UserType) VALUES (?, ?, ?, "student")', [email, password, universityId]);
        
        const [[{UserID}]] = await db.execute('SELECT LAST_INSERT_ID() as UserID');
 
        
        const [user] = await db.execute('SELECT UniversityID FROM User WHERE UserID = ?', [UserID]);

        res.status(201).send({ message: 'User registered', UserID, UniversityID: user[0].UniversityID });
    } catch (error) {
        res.status(500).send({ message: 'Error registering', error: error.message });
    } 
});

//student 
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await getDbConnection();
    try {
        const [users] = await db.execute('SELECT UserID, UniversityID, UserType FROM User WHERE Email = ? AND Password = ?', [email, password]);
        
        if (users.length) {
            res.send({ 
              message: 'Login successful', 
              userId: users[0].UserID, 
              UniversityID: users[0].UniversityID, 
              UserType: users[0].UserType 
            });
        } else {
            res.status(401).send({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error: error.message });
    } 
});



//superadmin 
app.get('/api/listusers', async (req, res) => {
    const db = await getDbConnection();
    try {
        
        const [users] = await db.execute('SELECT UserID, Email FROM User');
        
        
        res.send({ users });
    } catch (error) {
        
        res.status(500).send({ message: 'Error fetching users', error: error.message });
    } 
});

//superadmin 
app.post('/api/universities', async (req, res) => {
    const { name, location, description, numberOfStudents, emailDomain } = req.body;

    const db = await getDbConnection();
    try {
        await db.execute('INSERT INTO University (Name, Location, Description, NumberOfStudents, EmailDomain) VALUES (?, ?, ?, ?, ?)', [name, location, description, numberOfStudents, emailDomain]);
        res.status(201).send({ message: 'University created' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } 
});

//superadmin 
app.get('/api/listuniversities', async (req, res) => {
    const db = await getDbConnection();
    try {
        const [universities] = await db.execute('SELECT * FROM University');
        res.status(200).json({ universities }); 
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } 
});


//student 
app.get('/api/listrsos', async (req, res) => {
    const db = await getDbConnection();
    try {
        const [rsos] = await db.query('SELECT * FROM RSO');
        res.status(200).json(rsos);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving RSOs', error: error.message });
    } 
});

//admin
app.put('/api/rsos/:rsoId', async (req, res) => {
    const { rsoId } = req.params;
    const { name, universityId } = req.body;

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE RSO SET Name = ?, UniversityID = ? WHERE RSOID = ?', [name, universityId, rsoId]);
        res.send({ message: 'RSO updated' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } 
});

//admin
app.delete('/api/deletersos/:rsoId', async (req, res) => {
    const { rsoId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM RSO WHERE RSOID = ?', [rsoId]);
        res.send({ message: 'RSO deleted' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } 
});


//student - join
app.post('/api/rsos/:rsoId/users', async (req, res) => {
    const { rsoId } = req.params;
    const { userId, isAdmin } = req.body;

    const db = await getDbConnection();
    try {
       
        const [rso] = await db.execute('SELECT RSOID FROM RSO WHERE RSOID = ?', [rsoId]);
        const [user] = await db.execute('SELECT UserID FROM User WHERE UserID = ?', [userId]);

        if (rso.length === 0) {
            return res.status(404).send({ message: 'RSO not found' });
        }

        if (user.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        
        const [existingAffiliation] = await db.execute('SELECT * FROM UserRSOAffiliation WHERE UserID = ? AND RSOID = ?', [userId, rsoId]);
        if (existingAffiliation.length > 0) {
            return res.status(409).send({ message: 'User is already a member of this RSO' });
        }

        
        await db.execute('INSERT INTO UserRSOAffiliation (UserID, RSOID, IsAdmin) VALUES (?, ?, ?)', [userId, rsoId, isAdmin]);
        res.status(201).send({ message: 'User added to RSO successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error adding user to RSO', error: error.message });
    } 
});



//student 
app.delete('/api/rsos/:rsoId/users/:userId', async (req, res) => {
    const { rsoId, userId } = req.params;

    const db = await getDbConnection();
    try {
        
        const [affiliation] = await db.execute('SELECT * FROM UserRSOAffiliation WHERE RSOID = ? AND UserID = ?', [rsoId, userId]);
        if (affiliation.length === 0) {
            return res.status(404).send({ message: 'User is not a member of this RSO' });
        }

        
        await db.execute('DELETE FROM UserRSOAffiliation WHERE RSOID = ? AND UserID = ?', [rsoId, userId]);
        res.send({ message: 'User removed from RSO successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error removing user from RSO', error: error.message });
    } 
});


// student 
app.post('/api/rsos/request', async (req, res) => {
    const { universityId, name, description, requestedBy, listOfMembers } = req.body;
    const db = await getDbConnection();
    try {
        const query = 'INSERT INTO RSORequests (UniversityID, Name, Description, RequestedBy, Status, ListOfMembers) VALUES (?, ?, ?, ?, "pending", ?)';
        await db.execute(query, [universityId, name, description, requestedBy, listOfMembers]);
        res.status(201).send({ message: 'RSO creation request submitted successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error submitting RSO creation request', error: error.message });
    } 
});

// superadmin
app.get('/api/rsos/pendingrequests', async (req, res) => {
    const db = await getDbConnection();
    try {
        const [requests] = await db.execute('SELECT * FROM RSORequests WHERE Status = "pending"');
        res.status(200).json({ pendingRequests: requests });
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving RSO creation requests', error: error.message });
    } 
});


//superadmin 
app.put('/api/rsos/requests/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { status, listOfUserIds } = req.body; 

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE RSORequests SET Status = ? WHERE RequestID = ?', [status, requestId]);
        
        if (status === 'approved') {
           
            const [requests] = await db.execute('SELECT * FROM RSORequests WHERE RequestID = ?', [requestId]);
            const request = requests[0];
            
            if (request) {
                const [result] = await db.execute('INSERT INTO RSO (UniversityID, Name, Description) VALUES (?, ?, ?)', [request.UniversityID, request.Name, request.Description]);
                const rsoId = result.insertId;

               
                if(request.RequestedBy){
                    await db.execute('INSERT INTO UserRSOAffiliation (UserID, RSOID, IsAdmin) VALUES (?, ?, ?)', [request.RequestedBy, rsoId, true]);
                }

               
                for (const userId of listOfUserIds) {
                    if (userId !== request.RequestedBy) {
                        await db.execute('INSERT INTO UserRSOAffiliation (UserID, RSOID, IsAdmin) VALUES (?, ?, ?)', [userId, rsoId, false]);
                    }
                }
            }
        }

        res.send({ message: `RSO request ${status}.` });
    } catch (error) {
        res.status(500).send({ message: `Error updating RSO request status`, error: error.message });
    } 
});


//superadmin
app.put('/api/rsos/requests/:requestId/deny', async (req, res) => {
    const { requestId } = req.params;

    const db = await getDbConnection();
    try {
       
        const query = 'UPDATE RSORequests SET Status = "denied" WHERE RequestID = ?';
        await db.execute(query, [requestId]);

        res.send({ message: 'RSO creation request has been denied successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error denying RSO creation request', error: error.message });
    } 
});


//admin
app.put('/api/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { 
        name, description, time, date, locationId, 
        contactPhone, contactEmail, eventCategoryId, 
        rsoId, universityId, isVisibleToUniversity, 
        isVisibleToRSO, madeBy 
    } = req.body;

    const db = await getDbConnection();
    try {
        

        const query = 'UPDATE Event SET Name = ?, Description = ?, Time = ?, Date = ?, LocationID = ?, ContactPhone = ?, ContactEmail = ?, EventCategoryID = ?, RSOID = ?, UniversityID = ?, IsVisibleToUniversity = ?, IsVisibleToRSO = ? WHERE EventID = ? AND MadeBy = ?';
        await db.execute(query, [
            name, description, time, date, locationId, 
            contactPhone, contactEmail, eventCategoryId, 
            rsoId, universityId, isVisibleToUniversity, 
            isVisibleToRSO, eventId, madeBy
        ]);
        res.send({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating event', error: error.message });
    } 
});


//admin
app.delete('/api/deleteevents/:eventId', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM Event WHERE EventID = ?', [eventId]);
        res.send({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting event', error: error.message });
    } 
});


//admin 
app.post('/api/events', async (req, res) => {
    const { name, description, time, date, locationId, contactPhone, contactEmail, eventCategoryId, rsoId, isVisibleToUniversity, isVisibleToRSO, madeBy,universityId } = req.body;

    const db = await getDbConnection();
    try {
        // Check if the user is an admin of the RSO if an RSO ID is provided
        if (rsoId) {
            const [adminCheck] = await db.execute('SELECT * FROM UserRSOAffiliation WHERE UserID = ? AND RSOID = ? AND IsAdmin = TRUE', [madeBy, rsoId]);
            if (adminCheck.length === 0) {
                return res.status(403).send({ message: 'User is not an admin of the RSO' });
            }
        }

        
        const query = 'INSERT INTO Event (Name, Description, Time, Date, LocationID, ContactPhone, ContactEmail, EventCategoryID, RSOID,UniversityID, IsVisibleToUniversity, IsVisibleToRSO, IsApproved, MadeBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, FALSE, ?)';
        await db.execute(query, [name, description, time, date, locationId, contactPhone, contactEmail, eventCategoryId, rsoId, universityId,isVisibleToUniversity, isVisibleToRSO, madeBy]);
        res.status(201).send({ message: 'Event created successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error creating event', error: error.message });
    } 
});

//student
app.get('/api/events/public', async (req, res) => {
    const db = await getDbConnection();
    try {
        const [events] = await db.execute('SELECT * FROM Event WHERE IsPublic = TRUE');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving public events', error: error.message });
    } 
});

//student
app.get('/api/events/private/uni', async (req, res) => {
    const { universityId } = req.query; 

    const db = await getDbConnection();
    try {
        const [events] = await db.execute('SELECT * FROM Event WHERE UniversityID = ? AND IsVisibleToUniversity = TRUE', [universityId]);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving private university events', error: error.message });
    } 
});

//student
app.get('/api/events/private/rso', async (req, res) => {
    const { userId } = req.query; 

    const db = await getDbConnection();
    try {
        
        const [userRso] = await db.execute('SELECT RSOID FROM UserRSOAffiliation WHERE UserID = ?', [userId]);

        
        const rsoIds = userRso.map(rso => rso.RSOID);

        
        if (rsoIds.length > 0) {
            const query = 'SELECT * FROM Event WHERE RSOID IN (?) AND IsVisibleToRSO = TRUE';
            const [events] = await db.execute(query, [rsoIds]);
            res.status(200).json(events);
        } else {
            res.status(200).json([]); 
        }
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving private RSO events', error: error.message });
    } 
});


//admin 
app.put('/api/events/requestpublic/:eventId', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        const query = 'UPDATE Event SET PublicStatus = "pending" WHERE EventID = ?';
        await db.execute(query, [eventId]);

        res.send({ message: 'Public visibility requested for the event successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error requesting public visibility for the event', error: error.message });
    } 
});



//superadmin 
app.get('/api/events/pendingrequest', async (req, res) => {
    const db = await getDbConnection();
    try {
        const query = 'SELECT * FROM Event WHERE PublicStatus = "pending"';
        const [events] = await db.execute(query);

        res.status(200).json(events);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving events with pending public requests', error: error.message });
    } 
});


//superadmin
app.put('/api/events/:eventId/approve', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        
        await db.execute('UPDATE Event SET PublicStatus = "approved", IsPublic = TRUE WHERE EventID = ?', [eventId]);

        res.send({ message: 'Event approved and made public successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error approving event and making it public', error: error.message });
    } 
    
});


//superadmin
app.put('/api/events/:eventId/deny', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE Event SET PublicStatus = "denied" WHERE EventID = ?', [eventId]);

        res.send({ message: 'Public visibility request for the event has been denied.' });
    } catch (error) {
        res.status(500).send({ message: 'Error denying public visibility request for the event', error: error.message });
    } 
});



//student
app.post('/api/events/:eventId/comments-ratings', async (req, res) => {
    const { eventId } = req.params;
    const { userId, commentText, rating } = req.body; 

    const db = await getDbConnection();
    try {
        
        await db.execute('INSERT INTO Comment (EventID, UserID, CommentText, Rating) VALUES (?, ?, ?, ?)', [eventId, userId, commentText, rating || null]);
        res.status(201).send({ message: 'Comment and/or rating added successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error adding comment and/or rating', error: error.message });
    } 
});

//student
app.put('/api/events/:eventId/comments-ratings/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { commentText, rating } = req.body; 

    const db = await getDbConnection();
    try {
        
        await db.execute('UPDATE Comment SET CommentText = ?, Rating = ? WHERE CommentID = ?', [commentText || null, rating, commentId]);
        res.send({ message: 'Comment and/or rating updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating comment and/or rating', error: error.message });
    } 
});

//student 
app.delete('/api/events/:eventId/comments-ratings/:commentId', async (req, res) => {
    const { commentId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM Comment WHERE CommentID = ?', [commentId]);
        res.send({ message: 'Comment and/or rating deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting comment and/or rating', error: error.message });
    } 
});

//student 
app.get('/api/events/:eventId/comments-ratings', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        const query = `
            SELECT 
                Comment.CommentID, 
                Comment.UserID, 
                User.Email, 
                Comment.CommentText, 
                Comment.Rating, 
                Comment.Timestamp 
            FROM 
                Comment 
            JOIN User ON Comment.UserID = User.UserID 
            WHERE Comment.EventID = ?`;

        const [commentsRatings] = await db.query(query, [eventId]);
        res.status(200).json(commentsRatings);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving comments and ratings', error: error.message });
    } 
});
