const express = require('express'); // Import Express.js framework
const mysql = require('mysql2/promise'); // Import MySQL2 with Promise support for async/await operations
const app = express(); // Initialize Express application
app.use(express.json()); // Middleware to parse incoming JSON requests

// Database configuration (Sensitive information redacted)
const dbConfig = {
  host: 'localhost', // Database host
  user: 'root', // Database username (change for production security)
  password: '******', // Database password (redacted for security)
  database: 'school', // Database name
  timezone: 'Asia/Manila', // Set timezone to Manila, Philippines
  dateStrings: true // Ensures date values are returned as strings instead of JavaScript Date objects
};

// Endpoint to check student information based on LRN and birthday
app.post('/check', async (req, res) => {
  console.log('Request received:', req.body); // Log incoming request body

  const { lrn, secureKey } = req.body; // Extract LRN and secureKey from request

  // Validate request body to ensure required fields are provided
  if (!lrn || !secureKey) {
    console.log('Response status: 400 - Missing lrn or secureKey');
    return res.status(400).send('Missing lrn or secureKey');
  }

  try {
    const connection = await mysql.createConnection(dbConfig); // Establish a database connection

    // Query to check if the given LRN exists in the 'students' table
    const [students] = await connection.execute('SELECT * FROM students WHERE lrn = ?', [lrn]);
    if (students.length === 0) {
      console.log('Response status: 404 - LRN not found');
      return res.status(404).send('LRN not found'); // Return 404 if LRN is not found
    }

    const student = students[0]; // Extract student data
    const dbBirthday = new Date(student.birthday); // Convert stored birthday to Date object
    console.log(student); // Log student information for debugging
    
    const inputBirthday = secureKey; // SecureKey represents the student's birthday in MMDDYYYY format

    // Format the database birthday to MMDDYYYY format for comparison
    const formattedDbBirthday = dbBirthday.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const formattedDbBirthdayMMDDYYYY = `${formattedDbBirthday.slice(5, 7)}${formattedDbBirthday.slice(8, 10)}${formattedDbBirthday.slice(0, 4)}`;
    console.log(formattedDbBirthdayMMDDYYYY); // Log formatted birthday for debugging
    
    // Validate secureKey (birthday check)
    if (formattedDbBirthdayMMDDYYYY !== inputBirthday) {
      console.log('Response status: 400 - Invalid secureKey');
      return res.status(400).send('Invalid secureKey'); // Return error if birthday does not match
    }

    // Fetch the most recent scan record for the student
    const [scans] = await connection.execute(
      'SELECT * FROM scans WHERE studentID = ? ORDER BY timestamp DESC LIMIT 1',
      [student.id]
    );

    // If no scan records exist for the student
    if (scans.length === 0) {
      console.log('Response status: 404 - No scans found for this student');
      return res.status(404).send('No scans found for this student');
    }

    const recentScan = scans[0]; // Extract the most recent scan record
    
    // Prepare response object with necessary details
    const response = {
      status: recentScan.status, // Scan status (e.g., 'in', 'out')
      fname: student.fname, // First name
      lname: student.lname, // Last name
      timestamp: recentScan.timestamp // Time of last scan
    };
    console.log('Response status: 200', response); // Log successful response
    res.status(200).json(response); // Send response as JSON

    await connection.end(); // Close database connection to prevent memory leaks
  } catch (error) {
    console.error(error); // Log any errors that occur during execution
    console.log('Response status: 500 - Internal Server Error');
    res.status(500).send('Internal Server Error'); // Return generic error response
  }
});

// Start the server on port 4000
app.listen(4000, () => {
  console.log('Server is running on port 4000'); // Log server startup
});
