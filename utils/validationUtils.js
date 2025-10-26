/**
 * Check for duplicate styles in products array
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of duplicate style identifiers
 */
const checkDuplicateStyles = (products) => {
  const styleCount = {};
  const duplicates = [];

  products.forEach(product => {
    const style = product.style;
    if (styleCount[style]) {
      if (styleCount[style] === 1) {
        duplicates.push(style);
      }
      styleCount[style]++;
    } else {
      styleCount[style] = 1;
    }
  });

  return duplicates;
};

/**
 * Validate product data
 * @param {Array} products - Array of product objects
 * @returns {Object} - Validation result
 */
const validateProducts = (products) => {
  const errors = [];

  products.forEach((product, index) => {
    // Validate price
    if (!product.price || isNaN(product.price) || product.price <= 0) {
      errors.push(`Product ${index + 1} (${product.style}): Invalid price`);
    }

    // Validate size
    if (!product.size || product.size.trim() === '') {
      errors.push(`Product ${index + 1} (${product.style}): Size is required`);
    }

    // Validate style
    if (!product.style || product.style.trim() === '') {
      errors.push(`Product ${index + 1}: Style is required`);
    }

    // Validate division (should default to 'main' if empty)
    if (!product.division) {
      product.division = 'main';
    }

    // Validate colors array
    if (!product.colors || product.colors.length === 0) {
      errors.push(`Product ${index + 1} (${product.style}): At least one color is required`);
    }
  });

  // Check for duplicates
  const duplicates = checkDuplicateStyles(products);
  if (duplicates.length > 0) {
    errors.push(`Duplicate styles found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate brand name
 * @param {String} brand - Brand name
 * @returns {Boolean}
 */
const isValidBrand = (brand) => {
  const validBrands = ['Azure', 'Monsini', 'Risky'];
  return validBrands.includes(brand);
};

module.exports = {
  checkDuplicateStyles,
  validateProducts,
  isValidBrand
};

