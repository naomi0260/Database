const express = require('express');

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


const app = express();
require('dotenv').config();
const PORT = 5000;

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
    // Release the connection
    connection.release();
    // Start listening for incoming requests
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

app.use(bodyParser.json());


app.post('/api/users/register', async (req, res) => {
    const { username, password, userType, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const db = await getDbConnection();
    try {
        
        await db.execute('INSERT INTO User (Username, Password, UserType, Email) VALUES (?, ?, ?, ?)', [username, hashedPassword, userType, email]);
        
        
        const [[{UserID}]] = await db.execute('SELECT LAST_INSERT_ID() as UserID');
 
        res.status(201).send({ message: 'User registered', UserID });
    } catch (error) {
        res.status(500).send({ message: 'Error registering', error: error.message });
    } finally {
        await db.end();
    }
});




app.put('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body; 

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE User SET Username = ?, Email = ? WHERE UserID = ?', [username, email, userId]);
        res.send({ message: 'User updated' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating', error: error.message });
    } finally {
        await db.end();
    }
});


app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;

    const db = await getDbConnection();
    try {
        const [users] = await db.execute('SELECT * FROM User WHERE Username = ?', [username]);
        if (users.length && await bcrypt.compare(password, users[0].Password)) {
            
            const userId = users[0].UserID; 
            res.send({ message: 'Login successful', userId: userId });
        } else {
            
            res.status(401).send({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error: error.message });
    } finally {
        await db.end();
    }
});



app.post('/api/universities', async (req, res) => {
    const { name, location, description, numberOfStudents, emailDomain } = req.body;

    const db = await getDbConnection();
    try {
        await db.execute('INSERT INTO University (Name, Location, Description, NumberOfStudents, EmailDomain) VALUES (?, ?, ?, ?, ?)', [name, location, description, numberOfStudents, emailDomain]);
        res.status(201).send({ message: 'University created' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});


app.get('/api/listuniversities', async (req, res) => {
    const db = await getDbConnection();
    try {
        const [universities] = await db.query('SELECT * FROM University');
        res.status(200).json(universities);
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});


app.put('/api/universities/:universityId', async (req, res) => {
    const { universityId } = req.params;
    const { name, location, description, numberOfStudents, emailDomain } = req.body;

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE University SET Name = ?, Location = ?, Description = ?, NumberOfStudents = ?, EmailDomain = ? WHERE UniversityID = ?', [name, location, description, numberOfStudents, emailDomain, universityId]);
        res.send({ message: 'University updated' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating', error: error.message });
    } finally {
        await db.end();
    }
});


app.delete('/api/deleteuniversities/:universityId', async (req, res) => {
    const { universityId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM University WHERE UniversityID = ?', [universityId]);
        res.send({ message: 'University deleted' });
    } catch (error) {
        
        res.status(500).send({ message: 'Error deleting university', error: error.message });
    } finally {
        await db.end();
    }
});


app.post('/api/rsos', async (req, res) => {
    const { name, universityId } = req.body; 

    const db = await getDbConnection();
    try {
        await db.execute('INSERT INTO RSO (Name, UniversityID) VALUES (?, ?)', [name, universityId]);
        res.status(201).send({ message: 'RSO created successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error creating RSO', error: error.message });
    } finally {
        await db.end();
    }
});


app.post('/api/rsos/:rsoId/join', async (req, res) => {
    const { rsoId } = req.params;
    const userId = req.body.userId; 

    const db = await getDbConnection();
    try {
        await db.execute('INSERT INTO UserRSOAffiliation (UserID, RSOID, IsAdmin) VALUES (?, ?, false)', [userId, rsoId]);
        res.status(201).send({ message: 'Successfully joined RSO' });
    } catch (error) {
        res.status(500).send({ message: 'Error joining RSO', error: error.message });
    } finally {
        await db.end();
    }
});


app.get('/api/listrsos', async (req, res) => {
    const db = await getDbConnection();
    try {
        const [rsos] = await db.query('SELECT * FROM RSO');
        res.status(200).json(rsos);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving RSOs', error: error.message });
    } finally {
        await db.end();
    }
});

app.put('/api/rsos/:rsoId', async (req, res) => {
    const { rsoId } = req.params;
    const { name, universityId } = req.body;

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE RSO SET Name = ?, UniversityID = ? WHERE RSOID = ?', [name, universityId, rsoId]);
        res.send({ message: 'RSO updated' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});


app.delete('/api/deletersos/:rsoId', async (req, res) => {
    const { rsoId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM RSO WHERE RSOID = ?', [rsoId]);
        res.send({ message: 'RSO deleted' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});

app.post('/api/events', async (req, res) => {
    const { name, description, time, date, locationId, contactPhone, contactEmail, eventCategoryId, rsoId, visibility } = req.body;

    const db = await getDbConnection();
    try {
        const query = 'INSERT INTO Event (Name, Description, Time, Date, LocationID, ContactPhone, ContactEmail, EventCategoryID, RSOID, Visibility, IsApproved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)';
        await db.execute(query, [name, description, time, date, locationId, contactPhone, contactEmail, eventCategoryId, rsoId, visibility]);
        res.status(201).send({ message: 'Event created successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});


app.get('/api/listevents', async (req, res) => {
    const { userRole, universityId, rsoId } = req.query; 

    const db = await getDbConnection();
    try {
        let query = 'SELECT * FROM Event WHERE IsApproved = TRUE';
        let conditions = [];
        let queryParams = [];

        
        if (userRole === 'super_admin' || userRole === 'admin') {
            
        } else if (userRole === 'student') {
            conditions.push('(Visibility = "public" OR (Visibility = "private" AND LocationID IN (SELECT LocationID FROM Location WHERE UniversityID = ?)) OR (Visibility = "RSO" AND RSOID = ?))');
            queryParams.push(universityId, rsoId);
        } else {
            
            conditions.push('Visibility = "public"');
        }

        if (conditions.length) {
            query += ' AND ' + conditions.join(' AND ');
        }

        const [events] = await db.query(query, queryParams);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});



app.put('/api/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { name, description, time, date, locationId, contactPhone, contactEmail, eventCategoryId, visibility } = req.body;

    const db = await getDbConnection();
    try {
        const query = 'UPDATE Event SET Name = ?, Description = ?, Time = ?, Date = ?, LocationID = ?, ContactPhone = ?, ContactEmail = ?, EventCategoryID = ?, Visibility = ? WHERE EventID = ?';
        await db.execute(query, [name, description, time, date, locationId, contactPhone, contactEmail, eventCategoryId, visibility, eventId]);
        res.send({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating event', error: error.message });
    } finally {
        await db.end();
    }
});


app.put('/api/events/:eventId/approve', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('UPDATE Event SET IsApproved = TRUE WHERE EventID = ?', [eventId]);
        res.send({ message: 'Event approved successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error approving event', error: error.message });
    } finally {
        await db.end();
    }
});


app.delete('/api/deleteevents/:eventId', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM Event WHERE EventID = ?', [eventId]);
        res.send({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting event', error: error.message });
    } finally {
        await db.end();
    }
});




app.post('/api/rsos/:rsoId/users', async (req, res) => {
    const { rsoId } = req.params;
    const { userId, isAdmin } = req.body;

    const db = await getDbConnection();
    try {
        await db.execute('INSERT INTO UserRSOAffiliation (UserID, RSOID, IsAdmin) VALUES (?, ?, ?)', [userId, rsoId, isAdmin]);
        res.status(201).send({ message: 'User added to RSO successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error adding user to RSO', error: error.message });
    } finally {
        await db.end();
    }
});



app.delete('/api/rsos/:rsoId/users/:userId', async (req, res) => {
    const { rsoId, userId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM UserRSOAffiliation WHERE RSOID = ? AND UserID = ?', [rsoId, userId]);
        res.send({ message: 'User removed from RSO successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error removing user from RSO', error: error.message });
    } finally {
        await db.end();
    }
});


app.put('/api/users/:userId/university', async (req, res) => {
    const { userId } = req.params;
    const { universityId } = req.body;

    const db = await getDbConnection();
    try {
        // Assuming there's a field in the User table for UniversityID (not in the provided schema)
        await db.execute('UPDATE User SET UniversityID = ? WHERE UserID = ?', [universityId, userId]);
        res.send({ message: 'User’s affiliated university' });
    } catch (error) {
        res.status(500).send({ message: 'Error', error: error.message });
    } finally {
        await db.end();
    }
});


app.post('/api/events/:eventId/comments-ratings', async (req, res) => {
    const { eventId } = req.params;
    const { userId, commentText, rating } = req.body; 

    const db = await getDbConnection();
    try {
        // Insert comment or rating or both
        await db.execute('INSERT INTO Comment (EventID, UserID, CommentText, Rating) VALUES (?, ?, ?, ?)', [eventId, userId, commentText, rating || null]);
        res.status(201).send({ message: 'Comment and/or rating added successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error adding comment and/or rating', error: error.message });
    } finally {
        await db.end();
    }
});


app.put('/api/events/:eventId/comments-ratings/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { commentText, rating } = req.body; 

    const db = await getDbConnection();
    try {
        
        await db.execute('UPDATE Comment SET CommentText = ?, Rating = ? WHERE CommentID = ?', [commentText || null, rating, commentId]);
        res.send({ message: 'Comment and/or rating updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating comment and/or rating', error: error.message });
    } finally {
        await db.end();
    }
});

app.delete('/api/events/:eventId/comments-ratings/:commentId', async (req, res) => {
    const { commentId } = req.params;

    const db = await getDbConnection();
    try {
        await db.execute('DELETE FROM Comment WHERE CommentID = ?', [commentId]);
        res.send({ message: 'Comment and/or rating deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting comment and/or rating', error: error.message });
    } finally {
        await db.end();
    }
});

app.get('/api/events/:eventId/comments-ratings', async (req, res) => {
    const { eventId } = req.params;

    const db = await getDbConnection();
    try {
        const [commentsRatings] = await db.query('SELECT CommentID, UserID, CommentText, Rating, Timestamp FROM Comment WHERE EventID = ?', [eventId]);
        res.status(200).json(commentsRatings);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving comments and ratings', error: error.message });
    } finally {
        await db.end();
    }
});

app.post('/api/rsos/request', async (req, res) => {
    const { universityId, name, description, requestedBy } = req.body;

    try {
        const query = 'INSERT INTO RSORequests (UniversityID, Name, Description, RequestedBy, Status) VALUES (?, ?, ?, ?, "pending")';
        await db.promise().query(query, [universityId, name, description, requestedBy]);
        res.status(201).send({ message: 'RSO creation request submitted successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error submitting RSO creation request', error: error.message });
    }
});


app.get('/api/rsos/requests', async (req, res) => {
    try {
        const [requests] = await db.promise().query('SELECT * FROM RSORequests WHERE Status = "pending"');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving RSO creation requests', error: error.message });
    }
});

app.put('/api/rsos/requests/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body; 

    try {
        await db.promise().query('UPDATE RSORequests SET Status = ? WHERE RequestID = ?', [status, requestId]);
        
        if (status === 'approved') {
            // Automatically create the RSO upon approval
            const [request] = await db.promise().query('SELECT * FROM RSORequests WHERE RequestID = ?', [requestId]);
            if (request.length > 0) {
                const requestDetails = request[0];
                await db.promise().query('INSERT INTO RSO (UniversityID, Name, Description) VALUES (?, ?, ?)', [requestDetails.UniversityID, requestDetails.Name, requestDetails.Description]);
            }
        }

        res.send({ message: `RSO request ${status}.` });
    } catch (error) {
        res.status(500).send({ message: `Error updating RSO request status`, error: error.message });
    }
});


app.get('/api/events/pending-approval', async (req, res) => {
    

    const db = await getDbConnection();
    try {
        const query = "SELECT * FROM Event WHERE IsApproved = FALSE AND Visibility = 'public'";
        const [events] = await db.query(query);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving events awaiting approval', error: error.message });
    } finally {
        await db.end();
    }
});



