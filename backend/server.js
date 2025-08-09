const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use('/uploads/thumbnails', express.static(path.join(__dirname, 'Uploads/thumbnails')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/home', require('./routes/home'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/research', require('./routes/research'));
app.use('/api/publications', require('./routes/publications'));
app.use('/api/talks', require('./routes/talks'));
app.use('/api/teaching', require('./routes/teaching'));
app.use('/api/photos', require('./routes/photos'));

// Basic route
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));