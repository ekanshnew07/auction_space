/**
 * Module: backend/controllers/auth/actions/uploadAvatar.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
const User = require('../../../models/User');
const { serializeUser, uploadAvatarImage } = require('../authHelpers');

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const uploadResult = await uploadAvatarImage(req.file.buffer, req.file.mimetype);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatarUrl = uploadResult.secure_url;
    user.avatarEmoji = '';
    await user.save();

    return res.json({ message: 'Avatar updated', user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = uploadAvatar;
