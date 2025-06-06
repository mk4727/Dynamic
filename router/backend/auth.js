const express = require('express');
const router = express.Router();
const User = require('../../model/userModel');
const { isNotAuthenticated, isAuthenticated } = require('../../middleware/authMiddleware');

// Show login form
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('backend/auth/login');
});

// Process login
router.post('/login', isNotAuthenticated, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('err', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      req.flash('err', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Set session
    req.session.isAuthenticated = true;
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Set session cookie expiration
    if (rememberMe) {
      // 30 days
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }
    
    // Redirect to original destination or admin dashboard
    const redirectUrl = req.session.redirectTo || '/admin';
    delete req.session.redirectTo;
    
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    req.flash('err', 'An error occurred during login');
    res.redirect('/auth/login');
  }
});

// Register route (could be restricted to super admins only)
router.get('/register', isAuthenticated, (req, res) => {
  res.render('backend/auth/register');
});

// Process registration
router.post('/register', isAuthenticated, async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('err', 'Passwords do not match');
      return res.redirect('/auth/register');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('err', 'Email is already registered');
      return res.redirect('/auth/register');
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'admin'
    });
    
    await newUser.save();
    
    req.flash('success', 'New admin user created successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('err', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/auth/login');
  });
});

// Change password form
router.get('/change-password', isAuthenticated, (req, res) => {
  res.render('backend/auth/change-password');
});

// Process password change
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      req.flash('err', 'New passwords do not match');
      return res.redirect('/auth/change-password');
    }
    
    // Find user
    const user = await User.findById(req.session.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('err', 'Current password is incorrect');
      return res.redirect('/auth/change-password');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    req.flash('success', 'Password changed successfully');
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    req.flash('err', 'An error occurred while changing password');
    res.redirect('/auth/change-password');
  }
});

module.exports = router;