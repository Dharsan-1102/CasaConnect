const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

const User = require('./models/userSchema');
const Event = require('./models/Event');
const Issue = require('./models/Issue');
const Notice = require('./models/Notice');
const Visitor = require('./models/Visitor');
const AccessLog = require('./models/AccessLog');
const Society = require('./models/Society');
const Apartment = require('./models/Apartment');
const Flat = require('./models/Flat');
const Amenity = require('./models/Amenity');
const AmenityBooking = require('./models/AmenityBooking');
const Bill=require('./models/Bill');

dotenv.config();
const app = express();
app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests, try again later.'
});

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/send-otp', otpLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ error: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  try {
    await transporter.sendMail({
      to: email,
      subject: 'CasaConnect Email Verification',
      text: `Your OTP is: ${otp}`
    });
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.send({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('❌ Email sending failed:', err);
    res.status(500).send({ error: 'Failed to send OTP' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).send({ error: 'No OTP requested for this email' });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).send({ error: 'OTP expired' });
  }

  if (record.code !== otp) {
    return res.status(400).send({ error: 'Invalid OTP' });
  }

  record.verified = true;
  res.send({ success: true, message: 'OTP verified' });
});

app.post('/signup', async (req, res) => {
  const {
    name,
    apartment,
    flat,
    email,
    password,
    otp,
    phone_number,
    block,
    resident_role,
    profile_photo_url,
    status,
  } = req.body;

  try {
    if (!otpStore[email] || otpStore[email].code !== otp || otpStore[email].expiresAt < Date.now()) {
      return res.status(400).send({ error: 'Invalid or expired OTP' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        error: 'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send({ error: 'User already exists' });

    delete otpStore[email];

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      apartment,
      flat,
      email,
      password: hashedPassword,
      phone_number,
      block,
      resident_role,
      profile_photo_url,
      status,
      role: 'resident',
    });

    await user.save();
    res.send({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send({ error: 'Signup failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts === 5) {
        await transporter.sendMail({
          to: user.email,
          subject: 'Security Alert - Too Many Failed Logins',
          html: `<p>There were 5 failed login attempts on your CasaConnect account.</p>
                <p>If this wasn't you, please reset your password immediately using the following link:</p>
                <p><a href="http://localhost:5173/reset-password?email=${encodeURIComponent(user.email)}">Reset Password</a></p>`
        });
      }

      await user.save();
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    user.loginAttempts = 0;
    await user.save();

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role, name: user.name, profilePhoto: user.profilePhoto, userId: user._id,  apartment: user.apartment });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/residents', async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' });
    res.json(residents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

app.put('/resident/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resident' });
  }
});

app.delete('/resident/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resident' });
  }
});

app.get('/admin-events', authenticateAdmin, async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.delete('/admin-events/:id', authenticateAdmin, async (req, res) => { 
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.get('/admin-notices', authenticateAdmin, async (req, res) => {
  const notices = await Notice.find();
  res.json(notices);
});

app.post('/admin-notices', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // get admin's apartment
    const notice = new Notice({
      message: req.body.message,
      postedBy: user.name,
      apartment: user.apartment, // ← store apartment
    });
    await notice.save();
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

app.delete('/admin-notices/:id', authenticateAdmin, async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

app.get('/admin-issues', authenticateAdmin, async (req, res) => {
  const issues = await Issue.find();
  res.json(issues);
});

app.post('/admin-issues', authenticateAdmin, async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

app.delete('/admin-issues/:id', authenticateAdmin, async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

app.put('/admin-issues/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Issue not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/resident-events', authenticateUser, async (req, res) => {
  const user = await User.findById(req.user.id);
  const apartment = user.apartment;

  const events = await Event.find({ apartment });
  res.json(events);
});

app.get('/resident-notices', authenticateUser, async (req, res) => { 
  try {
    const user = await User.findById(req.user.id);
    const apartment = user.apartment;

    const data = await Notice.find({ apartment });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

app.post('/resident-issues', authenticateUser, async (req, res) => {
  try {
    const issue = new Issue({
      resident_id: req.user.id,
      category: req.body.category,
      description: req.body.description,
      status: req.body.status || 'Open'
    });
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

app.get('/resident-issues', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let issues;

    if (role === 'resident') {
      issues = await Issue.find({ resident_id: userId });
    } else {
      issues = await Issue.find();
    }

    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

app.put('/maintenance/issues/:id', authenticateUser, async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updated_at: Date.now() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Issue not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update issue status' });
  }
});

app.post('/visitor-add', async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);

    const accessLog = await AccessLog.create({
      user_id: visitor._id,
      entry_point: req.body.entry_point,
      entry_time: new Date()
    });

    res.json({ log: accessLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log visitor' });
  }
});

app.put('/checkout/:id', async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, {
      check_out_time: new Date()
    }, { new: true });

    await AccessLog.findOneAndUpdate(
      { user_id: req.params.id, exit_time: null },
      { exit_time: new Date() }
    );

    res.json(visitor);
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

app.get('/accesslog/:id', async (req, res) => {
  try {
    const log = await AccessLog.findById(req.params.id)
      .populate({
        path: 'user_id',
        populate: { path: 'approved_by', model: 'User' }
      });

    if (!log) return res.status(404).json({ error: 'Log not found' });

    res.json({
      visitor: log.user_id,
      approved_by: log.user_id.approved_by,
      entry_point: log.entry_point,
      entry_time: log.entry_time,
      logId: log._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

app.get('/visitors-checkedin', async (req, res) => {
  try {
    const checkedInVisitors = await Visitor.find({ check_out_time: null });
    res.json(checkedInVisitors);
  } catch (err) {
    console.error('Error fetching checked-in visitors:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.tokenExpiry = Date.now() + 3600000; 
  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${token}`;
  await transporter.sendMail({
    to: user.email,
    subject: 'Reset Your Password - CasaConnect',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link will expire in 1 hour.</p>`
  });

  res.json({ message: 'Reset link sent to your email.' });
});

app.post('/update-password', async (req, res) => {
  const { email, password } = req.body;
  const record = otpStore[email];

  if (!record?.verified) {
    return res.status(403).json({ error: 'OTP not verified or session expired' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters, with one uppercase letter, one number, and one special character.'
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.loginAttempts = 0;
    await user.save();

    delete otpStore[email];

    await transporter.sendMail({
      to: user.email,
      subject: 'CasaConnect Password Changed',
      html: `<p>Your password was successfully changed. If you did not initiate this, contact support.</p>`
    });

    res.json({ message: '✅ Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.post('/admin-create-user', async (req, res) => {
  const {
    name,
    apartment,
    flat,
    email,
    password,
    phone_number,
    block,
    resident_role,
    profile_photo_url,
    status = 'Active',
    shift_time,
    specialization,
    role,
  } = req.body;

  console.log('Received User Data:', req.body);

  try {
    if (role === 'resident' && (!apartment || !flat || !block || !resident_role || !phone_number)) {
      return res.status(400).json({ error: 'All resident details are required' });
    }

    if (role === 'guard') {
      if (!shift_time?.trim() || !phone_number?.trim()) {
        return res.status(400).json({ error: 'Shift time and phone number are required for guards' });
      }
    }

    if (role === 'maintenance' && (!specialization || !phone_number)) {
      return res.status(400).json({ error: 'Specialization and phone number are required for maintenance staff' });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, Email, Password, and Role are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone_number,
      profile_photo_url,
      status,
      apartment, 
    };

    if (role === 'resident') {
      Object.assign(newUserData, { apartment, flat, block, resident_role });
    } else if (role === 'guard') {
      Object.assign(newUserData, { apartment, shift_time });
    } else if (role === 'maintenance') {
      Object.assign(newUserData, { apartment, specialization });
    }

    const newUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.post('/admin-events-rsvp/:id', authenticateUser, async (req, res) => {
  try {
    const { email } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event.rsvp.includes(email)) {
      event.rsvp.push(email);
      await event.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'RSVP failed' });
  }
});

app.post('/society/add', async (req, res) => {
  try {
    const society = new Society(req.body);
    await society.save();
    res.status(201).json(society);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/society/all', async (req, res) => {
  try {
    const societies = await Society.find(); 
    res.json(Array.isArray(societies) ? societies : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/apartment/all', async (req, res) => {
  const apartments = await Apartment.find().populate('society_id');
  res.json(apartments);
});

app.post('/apartment/add', async (req, res) => {
  try {
    const apartment = new Apartment(req.body);
    await apartment.save();
    res.status(201).json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/flat/add', async (req, res) => {
  try {
    console.log("Creating Flat with:", req.body);
    const flat = new Flat(req.body);
    await flat.save();
    res.status(201).json(flat);
  } catch (err) {
    console.error("Flat creation failed:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/flat/all', async (req, res) => {
  try {
    const flats = await Flat.find();
    res.json(flats);
  } catch (err) {
    console.error('Error fetching flats:', err);
    res.status(500).json({ error: 'Failed to fetch flats' });
  }
});

app.post('/amenities', async (req, res) => {
  try {
    const amenity = new Amenity(req.body);
    await amenity.save();
    res.status(201).json(amenity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/amenities', async (req, res) => {
  try {
    const amenities = await Amenity.find().sort({ created_at: -1 });
    res.json(amenities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/bookings',authenticateUser, async (req, res) => {
  try {
    const { amenity_id, booking_date, start_time, end_time } = req.body;
    const resident_id = req.user.id;

    const newBooking = new AmenityBooking({
      resident_id,
      amenity_id,
      booking_date,
      start_time,
      end_time,
      status: 'Confirmed'
    });

    await newBooking.save();

    await Amenity.findByIdAndUpdate(
      amenity_id,
      { $inc: { available_slots: -1 } },
      { new: true }
    );

    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/bookings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await AmenityBooking.find({ resident_id: userId })
      .populate('amenity_id')
      .sort({ booking_date: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

app.get('/residents-by-apartment/:apartment', async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident', apartment: req.params.apartment });
    res.json(residents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/profile/upload-photo', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'casaconnect_profiles' },
      async (err, result) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: 'Upload failed' });
        }

        try {
          const user = await User.findByIdAndUpdate(
            req.user.id,
            { profile_photo_url: result.secure_url },
            { new: true }
          );

          return res.json({ url: result.secure_url });
        } catch (dbError) {
          console.error('MongoDB update error:', dbError);
          return res.status(500).json({ error: 'Database update failed' });
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  } catch (outerErr) {
    console.error('Unexpected server error:', outerErr);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/users/by-apartment/:apartment', async (req, res) => {
  try {
    const users = await User.find({ apartment: { $regex: new RegExp(`^${req.params.apartment}$`, 'i') } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/admin-events/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const apartment = user.apartment;

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'casaconnect_events' },
      async (err, result) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }

        const newEvent = new Event({
          title: req.body.title,
          description: req.body.description,
          date: req.body.date,
          time: req.body.time,
          location: req.body.location,
          posterUrl: result.secure_url,
          apartment
        });

        await newEvent.save();
        res.json(newEvent);
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/bills/create', async (req, res) => {
  try {
    const { resident_id, amount, category, due_date } = req.body;
    const bill = new Bill({
      resident_id,
      amount,
      category,
      due_date,
      status: 'Unpaid',
      generated_on: new Date()
    });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

app.get('/bills/by-resident/:residentId', async (req, res) => {
  try {
    const bills = await Bill.find({ resident_id: req.params.residentId });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.get('/flat/by-apartment/:apartmentName', async (req, res) => {
  try {
    const apartment = await Apartment.findOne({ name: req.params.apartmentName });

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    const flats = await Flat.find({ apartment_id: apartment._id });
    res.json(flats);
  } catch (err) {
    console.error('Error fetching flats by apartment:', err);
    res.status(500).json({ error: 'Failed to fetch flats' });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));