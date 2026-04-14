const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailService');

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log(`Starting registration for: ${email}`);
    const userExists = await User.findOne({ email });
    console.log(`User query complete. Exists: ${!!userExists}`);

    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let user;
    if (userExists) {
      console.log('Updating existing unverified user...');
      userExists.name = name;
      userExists.password = password;
      userExists.otp = { code: otpCode, expiresAt: otpExpires };
      user = await userExists.save();
    } else {
      console.log('Creating new user record...');
      user = await User.create({
        name,
        email,
        password,
        otp: {
          code: otpCode,
          expiresAt: otpExpires,
        },
      });
    }
    console.log(`User record saved successfully: ${user._id}`);

    if (user) {
      // Send real OTP email
      console.log(`🚀 Attempting OTP email delivery to: ${user.email}`);
      const emailStart = Date.now();
      await sendOTPEmail(user.email, otpCode, user.name);
      const emailEnd = Date.now();
      console.log(`✅ OTP email delivery finished in ${emailEnd - emailStart}ms`);
      
      res.status(201).json({
        message: 'Registration successful. OTP sent to email.',
        email: user.email,
      });
    } else {
      console.error('Failed to create user object');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('🔥 Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp.code !== code || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined; // Clear OTP
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: 'Email verified successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email first' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, verifyOTP };
