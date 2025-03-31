
const mongoose = require('mongoose');
const { Schema } = mongoose;


const messageSubSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
});


const messagesSchema = new Schema({
  usersId: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  messages: [messageSubSchema]
});

module.exports = mongoose.model('Messages', messagesSchema);
