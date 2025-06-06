const express = require('express');
const router = express.Router();
const User = require('../../model/userModel');
const { isAuthenticated } = require('../../middleware/authMiddleware');

// Get all users
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('backend/users/index', { users });
  } catch (error) {
    console.error(error);
    req.flash('err', 'Failed to load users');
    res.redirect('/admin');
  }
});

// Show edit user form
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('err', 'User not found');
      return res.redirect('/admin/users');
    }
    res.render('backend/users/edit', { user });
  } catch (error) {
    console.error(error);
    req.flash('err', 'Failed to load user');
    res.redirect('/admin/users');
  }
});

// Update user
router.put('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    // Don't allow user to deactivate themselves
    if (req.params.id === req.session.user.id && isActive === 'false') {
      req.flash('err', 'You cannot deactivate your own account');
      return res.redirect(`/admin/users/edit/${req.params.id}`);
    }
    
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      role,
      isActive: isActive === 'true'
    });
    
    req.flash('success', 'User updated successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('err', 'Failed to update user');
    res.redirect(`/admin/users/edit/${req.params.id}`);
  }
});

// Delete user
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // Don't allow user to delete themselves
    if (req.params.id === req.session.user.id) {
      req.flash('err', 'You cannot delete your own account');
      return res.redirect('/admin/users');
    }
    
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('err', 'Failed to delete user');
    res.redirect('/admin/users');
  }
});

module.exports = router;