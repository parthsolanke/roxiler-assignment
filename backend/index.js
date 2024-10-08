// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

const transactionRoutes = require("./routes/transactions");

app.use("/api/transactions", transactionRoutes);

module.exports = app;
