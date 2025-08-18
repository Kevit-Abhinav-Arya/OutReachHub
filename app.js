const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

//Routes
const authRoutes = require('./api/Routes/Authentication');
const workspaceRoutes = require('./api/Routes/workspaces');

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





//API routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);


//404 error
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
})


module.exports = app;