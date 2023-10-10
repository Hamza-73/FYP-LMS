const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 5000;

app.set("view engine", "ejs");

// Middlewares
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, HTTP authentication)
  optionsSuccessStatus: 204, // Respond with a 204 No Content status for preflight requests
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  exposedHeaders: 'Authorization', // Expose specific headers to the client
  maxAge: 3600, // How long preflight requests can be cached (in seconds)
  preflightContinue: false, // Pass the CORS preflight response to the next handler
  optionsSuccessStatus: 204, // Return 204 No Content for OPTIONS requests
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(fileUpload({
  useTempFiles:true
}));

app.use (bodyParser.urlencoded ({extended: true}));

// Paste your mongodb link
const mongoURI = 'mongodb://127.0.0.1:27017/lms';
// const mongoURI = 'mongodb+srv://hamza:hamzakhan1@cluster0.axs4hvz.mongodb.net/FYP-LMS?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const loginRoute = require('./routes/Login'); 
const superRoute = require('./routes/Supervisor');
const committeeRoute = require('./routes/Committe/Committee');
const vivaRoute = require('./routes/Committe/Viva');
const meetingRoute = require('./routes/Meeting');
const projectRoute = require('./routes/ProjectRequest');
const adminRoute = require('./routes/Admin');
const externalRoute = require('./routes/External');
const allocateRoute = require('./routes/Allocation');

app.use('/student', loginRoute);
app.use('/supervisor', superRoute);
app.use('/committee', committeeRoute);
app.use('/viva', vivaRoute);
app.use('/meeting', meetingRoute);
app.use('/projects', projectRoute);
app.use('/admin', adminRoute);
app.use('/external', externalRoute);
app.use('/allocation', allocateRoute);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});