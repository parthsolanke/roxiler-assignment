const axios = require("axios");
const Transaction = require("../models/Transaction");

exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    res.status(200).json({ message: "Database initialized with seed data" });
  } catch (err) {
    res.status(500).json({ error: "Failed to initialize database" });
  }
};

exports.listTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = "", month } = req.query;
  
    const query = {};
    if (month) {
      query.dateOfSale = { $regex: new RegExp(`-${month.padStart(2, '0')}-`) };
    }
  
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } },
      ];
    }
  
    const skip = (page - 1) * perPage;
  
    try {
      const transactions = await Transaction.find(query).skip(skip).limit(Number(perPage));
      const total = await Transaction.countDocuments(query);
      res.status(200).json({ total, transactions });
    } catch (err) {
      res.status(500).json({ error: "Error fetching transactions" });
    }
};

exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: { $regex: new RegExp(`-${month.padStart(2, '0')}-`) } };
  
    try {
      const totalSales = await Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, totalSaleAmount: { $sum: "$price" }, soldItems: { $sum: { $cond: ["$sold", 1, 0] } }, notSoldItems: { $sum: { $cond: ["$sold", 0, 1] } } } }
      ]);
      res.status(200).json(totalSales[0] || { totalSaleAmount: 0, soldItems: 0, notSoldItems: 0 });
    } catch (err) {
      res.status(500).json({ error: "Error fetching statistics" });
    }
};

exports.getBarChart = async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: { $regex: new RegExp(`-${month.padStart(2, '0')}-`) } };
  
    const priceRanges = [
      [0, 100], [101, 200], [201, 300], [301, 400], [401, 500], [501, 600], [601, 700], [701, 800], [801, 900], [901, Infinity]
    ];
  
    try {
      const result = await Transaction.aggregate([
        { $match: query },
        { $bucket: {
            groupBy: "$price",
            boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
            default: "901-above",
            output: { count: { $sum: 1 } }
          }
        }
      ]);
  
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: "Error fetching bar chart data" });
    }
};

exports.getPieChart = async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: { $regex: new RegExp(`-${month.padStart(2, '0')}-`) } };
  
    try {
      const result = await Transaction.aggregate([
        { $match: query },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);
  
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: "Error fetching pie chart data" });
    }
};
  
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;
  
    try {
      const statistics = await this.getStatistics({ query: { month } }, res);
      const barChart = await this.getBarChart({ query: { month } }, res);
      const pieChart = await this.getPieChart({ query: { month } }, res);
  
      res.status(200).json({ statistics, barChart, pieChart });
    } catch (err) {
      res.status(500).json({ error: "Error fetching combined data" });
    }
};
  
  
  
  
