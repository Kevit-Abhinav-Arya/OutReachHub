const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Database Connected'))
.catch(err => console.log('Database connection error:', err));

//Routes
const authRoutes = require('./api/Routes/Authentication');


//API routes
app.use('/api/auth', authRoutes);


module.exports = app;