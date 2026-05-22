const validateRegisterInput = (data) => {
  const { name, email, password, role } = data;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Please add a name');
  }

  if (!email) {
    errors.push('Please add an email');
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please add a valid email');
    }
  }

  if (!password) {
    errors.push('Please add a password');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (role && !['renter', 'owner', 'admin'].includes(role)) {
    errors.push('Invalid user role');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLoginInput = (data) => {
  const { email, password } = data;
  const errors = [];

  if (!email) {
    errors.push('Please provide an email');
  }

  if (!password) {
    errors.push('Please provide a password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateForgotPasswordInput = (data) => {
  const { email } = data;
  const errors = [];

  if (!email) {
    errors.push('Please provide an email');
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateResetPasswordInput = (data) => {
  const { password } = data;
  const errors = [];

  if (!password) {
    errors.push('Please provide a password');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput
};
