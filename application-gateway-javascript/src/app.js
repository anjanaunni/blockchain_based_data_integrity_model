const express = require('express');
const bodyParser = require('body-parser');
const userController = require('./controllers/userController');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/users', userController.createUser);
app.get('/users/:id', userController.getUserByEmail);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

