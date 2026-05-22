const validateListingInput = (data) => {
  const { title, description, category, pricePerDay, securityDeposit, address, coordinates, images } = data;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Please add a listing title');
  } else if (title.length > 100) {
    errors.push('Title cannot be more than 100 characters');
  }

  if (!description || description.trim() === '') {
    errors.push('Please add a description');
  } else if (description.length > 1000) {
    errors.push('Description cannot be more than 1000 characters');
  }

  const allowedCategories = ['Tools', 'Electronics', 'Vehicles', 'Fashion', 'Outdoor', 'Party Supplies', 'Other'];
  if (!category || !allowedCategories.includes(category)) {
    errors.push(`Please select a valid category from: ${allowedCategories.join(', ')}`);
  }

  if (pricePerDay === undefined || pricePerDay === null) {
    errors.push('Please add rental price per day');
  } else if (typeof pricePerDay !== 'number' || pricePerDay < 0) {
    errors.push('Price per day must be a non-negative number');
  }

  if (securityDeposit !== undefined && securityDeposit !== null) {
    if (typeof securityDeposit !== 'number' || securityDeposit < 0) {
      errors.push('Security deposit must be a non-negative number');
    }
  }

  if (!address || address.trim() === '') {
    errors.push('Please add an address/location name');
  }

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    errors.push('Please provide valid coordinates [longitude, latitude]');
  } else {
    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      errors.push('Coordinates must be valid longitude (-180 to 180) and latitude (-90 to 90)');
    }
  }

  if (images !== undefined && !Array.isArray(images)) {
    errors.push('Images must be an array of strings');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateListingInput
};
