const express = require('express');
const app = express();

// Import the routes for admin registration
const registerAdminRouter = require('./register_admin');

// Use the routes in the application
app.use('/admin', registerAdminRouter);

// Other middleware and configurations...

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
