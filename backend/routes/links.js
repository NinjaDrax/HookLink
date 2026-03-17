const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: attach isLiked to links for current user
async function withLikedStatus(links, userId) {
  const user = await User.findById(userId).select('likedLinks');
  const likedSet = new Set(user.likedLinks.map(id => id.toString()));
  return links.map(link => ({
    ...link.toObject(),
    isLiked: likedSet.has(link._id.toString())
  }));
}

// GET /api/links — current user's own links only
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true, addedBy: req.user._id };

    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Link.countDocuments(query);
    const links = await Link.find(query)
      .populate('category', 'name slug icon color')
      .populate('addedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const linksWithStatus = await withLikedStatus(links, req.user._id);
    res.json({ success: true, links: linksWithStatus, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/links/all — all links from every user (One for All)
router.get('/all', protect, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Link.countDocuments(query);
    const links = await Link.find(query)
      .populate('category', 'name slug icon color')
      .populate('addedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const linksWithStatus = await withLikedStatus(links, req.user._id);
    res.json({ success: true, links: linksWithStatus, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/links — any logged-in user can add a link
router.post('/', protect, async (req, res) => {
  try {
    const { title, url, imageUrl, description, category } = req.body;
    if (!title || !url || !imageUrl || !description || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const link = await Link.create({ title, url, imageUrl, description, category, addedBy: req.user._id });
    await link.populate('category', 'name slug icon color');
    await link.populate('addedBy', 'name avatar');
    res.status(201).json({ success: true, link: { ...link.toObject(), isLiked: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/links/:id — owner or admin can delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (link.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await link.deleteOne();
    // Remove from liked lists
    await User.updateMany({ likedLinks: req.params.id }, { $pull: { likedLinks: req.params.id } });
    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/links/:id — owner or admin can edit
router.put('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (link.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Link.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('category', 'name slug icon color')
      .populate('addedBy', 'name avatar');
    res.json({ success: true, link: { ...updated.toObject(), isLiked: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/links/:id/like — toggle like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    const user = await User.findById(req.user._id);
    const isLiked = user.likedLinks.map(id => id.toString()).includes(req.params.id);

    if (isLiked) {
      user.likedLinks = user.likedLinks.filter(id => id.toString() !== req.params.id);
      link.likes = Math.max(0, link.likes - 1);
      link.likedBy = link.likedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      user.likedLinks.push(req.params.id);
      link.likes += 1;
      link.likedBy.push(req.user._id);
    }

    await user.save();
    await link.save();
    res.json({ success: true, isLiked: !isLiked, likes: link.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/links/liked — user's liked links
router.get('/liked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'likedLinks',
      populate: [
        { path: 'category', select: 'name slug icon color' },
        { path: 'addedBy', select: 'name avatar' }
      ]
    });
    const links = (user.likedLinks || [])
      .filter(l => l && l.isActive !== false)
      .map(link => ({ ...link.toObject(), isLiked: true }));
    res.json({ success: true, links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
