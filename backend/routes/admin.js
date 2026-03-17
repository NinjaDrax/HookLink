const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const Category = require('../models/Category');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin
router.use(protect, adminOnly);

// POST /api/admin/links - Add new link
router.post('/links', async (req, res) => {
  try {
    const { title, url, imageUrl, description, category } = req.body;

    if (!title || !url || !imageUrl || !description || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const link = await Link.create({
      title,
      url,
      imageUrl,
      description,
      category,
      addedBy: req.user._id
    });

    await link.populate('category', 'name slug icon color');

    res.status(201).json({ success: true, link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/links/:id - Update link
router.put('/links/:id', async (req, res) => {
  try {
    const link = await Link.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug icon color');

    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    res.json({ success: true, link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/links/:id
router.delete('/links/:id', async (req, res) => {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    // Remove from all user liked/bookmarks
    await User.updateMany(
      { $or: [{ likedLinks: req.params.id }, { bookmarks: req.params.id }] },
      { $pull: { likedLinks: req.params.id, bookmarks: req.params.id } }
    );

    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/categories - Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const category = await Category.create({ name, icon: icon || '🔗', color: color || '#6366f1', createdBy: req.user._id });
    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    const linksUsingCategory = await Link.countDocuments({ category: req.params.id });
    if (linksUsingCategory > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${linksUsingCategory} links use this category` });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalLinks, totalCategories, totalUsers] = await Promise.all([
      Link.countDocuments({ isActive: true }),
      Category.countDocuments(),
      User.countDocuments()
    ]);
    res.json({ success: true, stats: { totalLinks, totalCategories, totalUsers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/links - All links for admin
router.get('/links', async (req, res) => {
  try {
    const links = await Link.find()
      .populate('category', 'name slug icon color')
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
