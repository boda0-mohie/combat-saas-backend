// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

// optional compound index for fetching conversation between two users
messageSchema.index({ from: 1, to: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
