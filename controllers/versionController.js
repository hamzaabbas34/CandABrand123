const { connect } = require('mongoose');
const Product = require('../models/Product');
const Release = require('../models/Release');
const { deleteVersionDirectory, deleteYearDirectory } = require('../utils/fileUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * Get all versions/releases
 */
const getVersions = async (req, res) => {
  try {
    const { brand } = req.query;

    const filter = {};
    if (brand) filter.brand = brand;

    const versions = await Release.find(filter)
      .sort({ year: -1, versionName: 1 })
      .lean();

    // Get product counts for each version
    const versionsWithCounts = await Promise.all(
      versions.map(async (version) => {
        const count = await Product.countDocuments({
          brand: version.brand,
          year: version.year,
          versionName: version.versionName,
          category :  version.category
        });

        return {
          ...version,
          productCount: count
        };
      })
      
    );

    console.log(versionsWithCounts)
    

    return successResponse(res, versionsWithCounts);

  } catch (error) {
    console.error('Get versions error:', error);
    return errorResponse(res, 500, 'Failed to fetch versions', error.message);
  }
};

/**
 * Delete entire version (all products + images)
 */
const deleteVersion = async (req, res) => {
  try {
    const { brand, year, versionName } = req.params;

    // Delete all products for this version
    const deleteResult = await Product.deleteMany({
      brand,
      year: Number(year),
      versionName
    });

    // Delete release
    await Release.deleteOne({
      brand,
      year: Number(year),
      versionName
    });

    // Delete images directory
    deleteVersionDirectory(brand, Number(year), versionName);

    return successResponse(
      res, 
      { deletedCount: deleteResult.deletedCount },
      'Version deleted successfully'
    );

  } catch (error) {
    console.error('Delete version error:', error);
    return errorResponse(res, 500, 'Failed to delete version', error.message);
  }
};

/**
 * Delete entire year (all versions + products + images)
 */
const deleteYear = async (req, res) => {
  try {
    const { brand, year } = req.params;

    // Delete all products for this year
    const deleteResult = await Product.deleteMany({
      brand,
      year: Number(year)
    });

    // Delete all releases for this year
    await Release.deleteMany({
      brand,
      year: Number(year)
    });

    // Delete images directory
    deleteYearDirectory(brand, Number(year));

    return successResponse(
      res,
      { deletedCount: deleteResult.deletedCount },
      'Year deleted successfully'
    );

  } catch (error) {
    console.error('Delete year error:', error);
    return errorResponse(res, 500, 'Failed to delete year', error.message);
  }
};

module.exports = {
  getVersions,
  deleteVersion,
  deleteYear
};

