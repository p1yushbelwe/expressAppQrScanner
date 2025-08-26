// index.js
const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');

// Port on which APIs will be ON
const port = 15039;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
// Allows express and browser to parse provided form string URL
app.use(express.urlencoded({ extended: true }));

// Create MySQL connection
const db = mysql.createConnection({
  host: 'main-maindatabase.g.aivencloud.com',     // replace with your host
  user: 'avnadmin',          // replace with your username
  password: 'AVNS_TaU4jmC-KvP2QVdi7z2',  // replace with your password
  database: 'main', // replace with your database name
  port: 15039
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database!');
  }
});

// Route 1: /check
app.get('/check', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Route 2: /userId/:userId
app.get('/userId/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM login WHERE userId = ?';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// Route 3: /qrId/:qrId
app.get('/qrId/:qrId', (req, res) => {
  const qrId = req.params.qrId;
  const query = 'SELECT * FROM attendanceinfo WHERE uniqueMainQrId = ?';
  db.query(query, [qrId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// Route 3: /users
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM login';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Route 4: /post/postData
// How Search Url Looks Like :http://localhost:3000/post/postData?userId=24007001&userPassword=12345678&userName=Sachin
app.post('/post/postUserData', (req, res) => {

  const { userId, userPassword, userName } = req.body;
  // Make sure all parameters are provided
  if (!userId || !userPassword || !userName) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  // SQL query
  const postCode = 'INSERT INTO login (userId, userPassword, userName) VALUES (?, ?, ?)';

  db.query(postCode, [userId, userPassword, userName], (err, result) => {
    if (err) {
      console.log(err.message);  // Log the error in console
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User Registered', insertedId: result.insertId });
  });
});

// Route 5: /post/postQrData
app.post('/post/postQrData', (req, res) => {

  // Gets Data from body URL 
  const { uniqueMainQrId, memberName, memberEmail } = req.body;


  const scannedStatus = 0;
  const postQrCode = 'INSERT INTO attendanceinfo (uniqueMainQrId, memberName, memberEmail,scannedStatus) VALUES (?, ?, ?, ?)';

  // Check if required parameters are present
  if (!uniqueMainQrId || !memberEmail || !memberName) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  // Logic to insert in database
  db.query(postQrCode, [uniqueMainQrId, memberName, memberEmail, scannedStatus], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Member Registered', insertedId: result.insertId });
  });
});


// Route 6: /members : See all data from attendanceDatabase
app.get('/members', (req, res) => {
  const query = 'SELECT * FROM attendanceinfo';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Route 7: /user/delete/:deleteId
app.delete('/user/delete/:deleteId', (req, res) => {
  const { deleteId } = req.params;
  const deleteUserQuery = 'DELETE FROM login WHERE userId = ?';
  db.query(deleteUserQuery, [deleteId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    if (result.affectedRows == 0) {
      return res.status(404).json({ error: 'No such user in database' })
    }
    res.status(200).json('User succesfully deleted');
  })
});

app.delete('/member/delete/:memberId', (req, res) => {
  const memberId = req.params;
  const deleteMemberQuery = 'DELETE FROM attendanceinfo WHERE memberId = ?'
  db.query(deleteMemberQuery, [memberId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed To Delete member' })
    }
    if (result.affectedRows == 0) {
      return res.status(404).json({ error: 'No such member in database' });
    }
    res.status(200).json('Member successfully deleted');
  })

});



// Start server
app.listen(port, () => {
  console.log(`Server running successfully!`);
});