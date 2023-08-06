const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

const mongoURI = 'mongodb://127.0.0.1:27017/lms';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Replace this with actual user model and routes implementation
// For this example, let's assume you have a User model and a login route
const User = require('./models/Student/User');
const loginRoute = require('./routes/Student/Login');
const projectRoute = require('./routes/Student/Project');

app.use('/login', loginRoute);
app.use('/project', projectRoute);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});