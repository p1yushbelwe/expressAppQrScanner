// index.js
const express = require('express');
const mysql = require('mysql2');
const app = express();

// Port on which APIs will be ON
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Allows express and browser to parse provided form string URL
app.use(express.urlencoded({extended : true}));

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',     // replace with your host
  user: 'root',          // replace with your username
  password: '123456789',  // replace with your password
  database: 'main' // replace with your database name
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

  const {userId, userPassword, userName} = req.body;
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
app.post('/post/postQrData', (req,res) => {

  // Gets Data from body URL 
  const {uniqueMainQrId, memberName, memberEmail} = req.body;

  
  const scannedStatus = 0;
  const postQrCode = 'INSERT INTO attendanceinfo (uniqueMainQrId, memberName, memberEmail,scannedStatus) VALUES (?, ?, ?, ?)';

  // Check if required parameters are present
  if (!uniqueMainQrId || !memberEmail || !memberName) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }  

  // Logic to insert in database
  db.query(postQrCode, [uniqueMainQrId, memberName, memberEmail, scannedStatus] , (err,result) => {
    if(err){
      return res.status(500).json({error : err.message});
    }
    res.json({ message: 'Member Registered', insertedId: result.insertId });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});