const express = require('express');
const router = express.Router();
const College = require('../models/College');

// Get all colleges with advanced filtering
router.get('/', async (req, res) => {
  try {
    const { type, country, search, degree, course } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (degree) filter['courses.level'] = degree;
    if (course) filter['courses.name'] = { $regex: course, $options: 'i' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    const colleges = await College.find(filter).sort({ name: 1 });
    res.json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('❌ Error fetching colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching colleges',
      error: error.message
    });
  }
});

// Get colleges by type
router.get('/type/:type', async (req, res) => {
  try {
    const colleges = await College.find({ type: req.params.type }).sort({ rating: -1 });
    res.json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('❌ Error fetching colleges by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching colleges by type',
      error: error.message
    });
  }
});

// Get colleges by country
router.get('/country/:country', async (req, res) => {
  try {
    const colleges = await College.find({ 
      country: { $regex: req.params.country, $options: 'i' } 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('❌ Error fetching colleges by country:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching colleges by country',
      error: error.message
    });
  }
});

// Get colleges by degree level
router.get('/degree/:degree', async (req, res) => {
  try {
    const colleges = await College.find({ 
      'courses.level': req.params.degree 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    console.error('❌ Error fetching colleges by degree:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching colleges by degree level',
      error: error.message
    });
  }
});

// Get college statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await College.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalStudents: { $sum: '$totalStudents' },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const countryStats = await College.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          totalStudents: { $sum: '$totalStudents' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const degreeStats = await College.aggregate([
      { $unwind: '$courses' },
      {
        $group: {
          _id: '$courses.level',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalStats = await College.aggregate([
      {
        $group: {
          _id: null,
          totalColleges: { $sum: 1 },
          totalStudents: { $sum: '$totalStudents' },
          avgRating: { $avg: '$rating' },
          uniqueCountries: { $addToSet: '$country' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: stats,
        byCountry: countryStats,
        byDegree: degreeStats,
        overall: totalStats[0] || {}
      }
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Get available countries
router.get('/countries/list', async (req, res) => {
  try {
    const countries = await College.distinct('country');
    res.json({
      success: true,
      data: countries.sort()
    });
  } catch (error) {
    console.error('❌ Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching countries',
      error: error.message
    });
  }
});

// Get available degree levels
router.get('/degrees/list', async (req, res) => {
  try {
    const degrees = await College.distinct('courses.level');
    res.json({
      success: true,
      data: degrees.sort()
    });
  } catch (error) {
    console.error('❌ Error fetching degrees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching degree levels',
      error: error.message
    });
  }
});

// Add new college
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received college data:', req.body);
    
    const college = new College(req.body);
    const savedCollege = await college.save();
    
    console.log('✅ College saved successfully:', savedCollege.name);
    
    res.status(201).json({
      success: true,
      message: 'College added successfully',
      data: savedCollege
    });
  } catch (error) {
    console.error('❌ Error adding college:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding college',
      error: error.message
    });
  }
});

module.exports = router;