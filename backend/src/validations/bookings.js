const validateBookingInput = (data) => {
  const { listingId, startDate, endDate } = data;
  const errors = [];

  if (!listingId) {
    errors.push('Please provide a listingId');
  } else if (!/^[0-9a-fA-F]{24}$/.test(listingId)) {
    errors.push('Invalid listingId format');
  }

  if (!startDate) {
    errors.push('Please provide a start date');
  } else {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date format');
    }
  }

  if (!endDate) {
    errors.push('Please provide an end date');
  } else {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date format');
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (end <= start) {
        errors.push('End date must be after start date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateBookingInput
};
