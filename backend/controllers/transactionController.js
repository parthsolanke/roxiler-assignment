// controllers/transactionController.js
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
  try {
    const { page = 1, perPage = 10, month, search } = req.query;

    if (month && (!/^(0?[1-9]|1[0-2])$/.test(month))) {
      return res.status(400).json({ error: "Invalid month parameter. It must be between 1 and 12." });
    }
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

    if (pageNumber < 1 || isNaN(pageNumber)) {
      return res.status(400).json({ error: "Page must be a positive integer." });
    }
    if (perPageNumber < 1 || isNaN(perPageNumber)) {
      return res.status(400).json({ error: "Per Page must be a positive integer." });
    }

    let pipeline = [];
    if (month) {
      const monthNumber = parseInt(month, 10);
      pipeline.push({
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber]
          }
        }
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { price: !isNaN(Number(search)) ? Number(search) : undefined }
          ].filter(Boolean)
        }
      });
    }

    pipeline.push(
      { $skip: (pageNumber - 1) * perPageNumber },
      { $limit: perPageNumber }
    );

    const transactions = await Transaction.aggregate(pipeline);
    const totalCount = await Transaction.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month ? parseInt(month, 10) : 0]
      }
    });

    res.status(200).json({
      data: transactions,
      pagination: {
        currentPage: pageNumber,
        perPage: perPageNumber,
        totalPages: Math.ceil(totalCount / perPageNumber),
        totalRecords: totalCount
      }
    });
  } catch (error) {
    console.error("Error fetching paginated transactions: ", error);
    res.status(500).json({ error: "Error fetching transactions" });
  }
};


const getStatisticsData = async (month) => {
  const monthNumber = parseInt(month, 10);

  const totalSales = await Transaction.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthNumber]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSaleAmount: { $sum: "$price" },
        soldItems: { $sum: { $cond: ["$sold", 1, 0] } },
        notSoldItems: { $sum: { $cond: ["$sold", 0, 1] } }
      }
    }
  ]);
  return totalSales[0] || { totalSaleAmount: 0, soldItems: 0, notSoldItems: 0 };
};

const getBarChartData = async (month) => {
  const monthNumber = parseInt(month, 10);

  const boundaries = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const rangeLabels = boundaries.slice(1).map((boundary, index) => {
    const lowerBound = boundaries[index];
    const upperBound = boundary;
    return `${lowerBound} - ${upperBound}`;
  });

  rangeLabels.push("901+");

  const result = await Transaction.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthNumber],
        },
      },
    },
    {
      $bucket: {
        groupBy: "$price",
        boundaries: boundaries,
        default: "901+",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const countMap = rangeLabels.reduce((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {});

  result.forEach((item) => {
    if (item._id === "901+") {
      countMap["901+"] = item.count;
    } else {
      const index = boundaries.indexOf(item._id);
      if (index > 0) {
        const lowerBound = boundaries[index - 1];
        const upperBound = boundaries[index];
        countMap[`${lowerBound} - ${upperBound}`] = item.count;
      }
    }
  });

  return Object.entries(countMap).map(([priceRange, count]) => ({
    priceRange,
    count,
  }));
};

const getPieChartData = async (month) => {
  const monthNumber = parseInt(month, 10);

  const result = await Transaction.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthNumber]
        }
      }
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    }
  ]);
  return result;
};

exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: "Month parameter is required" });

  if (!/^(0?[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ error: "Invalid month parameter. It must be between 1 and 12." });
  }

  try {
    const statistics = await getStatisticsData(month);
    res.status(200).json(statistics);
  } catch (err) {
    res.status(500).json({ error: "Error fetching statistics" });
  }
};

exports.getBarChart = async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ error: "Month parameter is required" });
  }

  if (!/^(0?[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ error: "Invalid month parameter. It must be between 1 and 12." });
  }

  try {
    const barChart = await getBarChartData(month);
    res.status(200).json(barChart);
  } catch (err) {
    res.status(500).json({ error: "Error fetching bar chart data" });
  }
};

exports.getPieChart = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: "Month parameter is required" });

  if (!/^(0?[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ error: "Invalid month parameter. It must be between 1 and 12." });
  }

  try {
    const pieChart = await getPieChartData(month);
    res.status(200).json(pieChart);
  } catch (err) {
    res.status(500).json({ error: "Error fetching pie chart data" });
  }
};

exports.getCombinedData = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: "Month parameter is required" });

  if (!/^(0?[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ error: "Invalid month parameter. It must be between 1 and 12." });
  }

  try {
    const statistics = await getStatisticsData(month);
    const barChart = await getBarChartData(month);
    const pieChart = await getPieChartData(month);

    res.status(200).json({ statistics, barChart, pieChart });
  } catch (err) {
    console.error("Error fetching combined data: ", err);
    res.status(500).json({ error: "Error fetching combined data" });
  }
};


