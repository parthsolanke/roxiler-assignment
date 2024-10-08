// models/Transaction.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  sold: { type: Boolean, required: true },
  dateOfSale: { type: Date, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
