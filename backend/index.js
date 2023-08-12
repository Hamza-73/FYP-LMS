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
// const mongoURI = 'mongodb+srv://ameerhamza:passwordkyahai?@cluster0.tehlhzm.mongodb.net/FYP-LMS?retryWrites=true&w=majority';
// const mongoURI = 'mongodb+srv://ameerhamza:passwordkyahai%3F@cluster0.tehlhzm.mongodb.net/FYP-LMS?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const loginRoute = require('./routes/Student/Login');
const projectRoute = require('./routes/Student/Project');
const superRoute = require('./routes/Supervisor/Supervisor')
const committeeRoute = require('./routes/Committe/Committee')

app.use('/login', loginRoute);
app.use('/project', projectRoute);
app.use('/supervisor', superRoute)
app.use('/committee', committeeRoute)

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});