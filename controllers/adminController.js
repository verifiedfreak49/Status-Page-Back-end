const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for signing JWTs (in production, store it in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';


const registerAdmin = async (req, res) => {
    const { email, password} = req.body;
    
    // Check if the email has the allowed domain
    if (!email.endsWith('@service.admin.com')) {
      return res.status(400).json({ message: 'Email must end with @service.admin.com' });
    }
    
    try {
      // Check if an admin with the same email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create new admin document
      const admin = new Admin({
        email,
        passwordHash: hashedPassword,
      });
      await admin.save();
      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering admin', error });
    }
  };


// POST /api/admin/login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Check if email is valid (must end with @service.admin.com)
  if (!email.endsWith('@service.admin.com')) {
    return res.status(401).json({ message: 'Unauthorized domain' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password with hash
    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT (expires in, say, 1 day)
    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, message: 'Login successful' });

    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
};
