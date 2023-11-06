const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');

// Middlewares
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  exposedHeaders: 'Authorization',
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(fileUpload({
  useTempFiles: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const mongoURI = 'mongodb://127.0.0.1:27017/lms';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Routes
const loginRoute = require('./routes/Login');
const superRoute = require('./routes/Supervisor');
const committeeRoute = require('./routes/Committe/Committee');
const vivaRoute = require('./routes/Committe/Viva');
const meetingRoute = require('./routes/Meeting');
const projectRoute = require('./routes/ProjectRequest');
const adminRoute = require('./routes/Admin');
const externalRoute = require('./routes/External');
const allocateRoute = require('./routes/Allocation');
const rules = require('./routes/Rules');

app.use('/student', loginRoute);
app.use('/supervisor', superRoute);
app.use('/committee', committeeRoute);
app.use('/viva', vivaRoute);
app.use('/meeting', meetingRoute);
app.use('/projects', projectRoute);
app.use('/admin', adminRoute);
app.use('/external', externalRoute);
app.use('/allocation', allocateRoute);
app.use('/rules', rules);

const User = require('./models/User')
const Supervisor = require('./models/Supervisor')
const Committee = require('./models/Committee')
const Admin = require('./models/Admin')
const External = require('./models/External')

const bcrypt = require('bcrypt');

app.post('/upload/:userType', async (req, res) => {
  const { userType } = req.params;
  if (!req.files || !req.files.excelFile) {
    return res.status(400).json({ success: false, message: 'No files were uploaded.' });
  }

  console.log('file is ', req.files.excelFile)
  const excelFile = req.files.excelFile;
  const workbook = XLSX.readFile(excelFile.tempFilePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  let excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log('data is ', excelData)

  // Hash passwords before storing
  if (userType === 'committee' || userType === 'supervisor' || userType === 'admin') {
    excelData = excelData.map((user) => {
      
      const password = user.password.toString();

      // Hash the password using bcrypt
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      return {
        ...user,
        password: hashedPassword,
      };
    });
  } else if (userType === 'user') {
    // For users, hash 'cnic' and add it to 'password'
    excelData = excelData.map((user) => {
      if(user.password){
        const password = user.password.toString();
  
        // Validate password length
        if (password.toString().length < 6) {
          return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
      }

      if (user.cnic) {
        // Hash the 'cnic' using bcrypt and add it to 'password'
        const saltRounds = 10;
        const cnic = user.cnic.toString()
        const hashedCnic = bcrypt.hashSync(cnic, saltRounds);

        return {
          ...user,
          password: hashedCnic,
        };
      }
      return user;
    });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid schema type.' });
  }

  try {
    switch (userType) {
      case 'user':
        await User.insertMany(excelData);
        break;
      case 'supervisor':
        await Supervisor.insertMany(excelData);
        break;
      case 'committee':
        await Committee.insertMany(excelData);
        break;
      case 'admin':
        await Admin.insertMany(excelData);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid schema type.' });
    }

    return res.json({ success: true, message: 'File uploaded and data imported to MongoDB.' });
  } catch (err) {
    console.error('Error occurred while inserting data:', err);
    return res.status(500).json({ success: false, message: 'Some Error occurred. Check if your excel file data is valid.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});