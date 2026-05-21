const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Please add a name' });
  }

  if (!email) {
    return res.status(400).json({ success: false, error: 'Please add an email' });
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please add a valid email' });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Please add a password' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }

  if (role && !['renter', 'owner', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid user role' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Please provide an email' });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Please provide a password' });
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Please provide an email' });
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email' });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: 'Please provide a password' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
