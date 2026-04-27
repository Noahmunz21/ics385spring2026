require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');
    await User.deleteMany({});
    const admin = new User({
      email: 'admin@hanahideaway.com',
      password: 'HanaAdmin2026'
    });
    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@hanahideaway.com');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seedAdmin();
