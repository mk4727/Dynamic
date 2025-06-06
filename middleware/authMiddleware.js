module.exports = {
    // Middleware to check if user is authenticated
    isAuthenticated: (req, res, next) => {
      if (req.session.isAuthenticated) {
        return next();
      }
      
      // Store the requested URL to redirect after login
      req.session.redirectTo = req.originalUrl;
      req.flash('err', 'Please log in to access the admin area');
      res.redirect('/auth/login');
    },
    
    // Middleware to check if user is already logged in
    isNotAuthenticated: (req, res, next) => {
      if (!req.session.isAuthenticated) {
        return next();
      }
      res.redirect('/admin');
    },
  
    // Middleware to set user data in locals for views
    setLocals: (req, res, next) => {
      res.locals.currentUser = req.session.user || null;
      res.locals.isAuthenticated = req.session.isAuthenticated || false;
      next();
    }
  };