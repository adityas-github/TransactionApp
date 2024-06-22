const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  category: String,
  image: String,
  sold: {
    type: Boolean,
    required: true
  },
  dateOfSale: {
    type: Date,
    required: true
  }
});

transactionSchema.index({ dateOfSale: 1 });
transactionSchema.index({ price: 1 });
transactionSchema.index({ title: 'text', description: 'text' });

transactionSchema.virtual('monthName').get(function() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[this.dateOfSale.getMonth()];
});

const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');

module.exports = Transaction;