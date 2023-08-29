const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Paste your mongodb link
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
const superRoute = require('./routes/Supervisor/Supervisor');
const committeeRoute = require('./routes/Committe/Committee');
const vivaRoute = require('./routes/Committe/Viva')

app.use('/login', loginRoute); //yah login ka route yaha user's ki api yaha run hogi
app.use('/supervisor', superRoute)  // yah supervisor
app.use('/committee', committeeRoute)  //yah committee
app.use('/viva', vivaRoute);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});