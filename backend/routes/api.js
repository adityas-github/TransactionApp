const express = require("express");
const axios = require("axios");
const Transaction = require("../models/Transaction");
const router = express.Router();

router.get("/initialize-database", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);
    res.status(200).send("Database initialized successfully");
  } catch (error) {
    res.status(500).send("Error initializing database");
  }
});

router.get("/combined-data", async (req, res) => {
  const { month } = req.query;
  const query = month
    ? { dateOfSale: { $regex: new RegExp(`-${month}-`) } }
    : {};

  try {
    const transactions = await Transaction.find(query);
    const statistics = await axios.get(
      `http://localhost:5500/api/statistics?month=${month}`
    );
    const barChart = await axios.get(
      `http://localhost:5500/api/bar-chart?month=${month}`
    );
    const pieChart = await axios.get(
      `http://localhost:5500/api/pie-chart?month=${month}`
    );

    res.status(200).json({
      transactions,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    });
  } catch (error) {
    res.status(500).send("Error fetching combined data");
  }
});

router.get("/statistics", async (req, res) => {
  const { month } = req.query;
  const query = {};

  if (month) {
    query.dateOfSale = { $regex: new RegExp(`-${month}-`) };
  }

  const totalSaleAmount = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ]);

  const totalSoldItems = await Transaction.countDocuments({
    ...query,
    sold: true,
  });
  const totalNotSoldItems = await Transaction.countDocuments({
    ...query,
    sold: false,
  });

  res.status(200).json({
    totalSaleAmount: totalSaleAmount[0]?.total || 0,
    totalSoldItems,
    totalNotSoldItems,
  });
});

router.get("/bar-chart", async (req, res) => {
  const { month } = req.query;
  const query = {};

  if (month) {
    query.dateOfSale = { $regex: new RegExp(`-${month}-`) };
  }

  const priceRanges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "201-300", min: 201, max: 300 },
    { range: "301-400", min: 301, max: 400 },
    { range: "401-500", min: 401, max: 500 },
    { range: "501-600", min: 501, max: 600 },
    { range: "601-700", min: 601, max: 700 },
    { range: "701-800", min: 701, max: 800 },
    { range: "801-900", min: 801, max: 900 },
    { range: "901-above", min: 901, max: Infinity },
  ];

  const barChartData = await Promise.all(
    priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({
        ...query,
        price: { $gte: range.min, $lt: range.max },
      });
      return { range: range.range, count };
    })
  );

  res.status(200).json(barChartData);
});

router.get("/pie-chart", async (req, res) => {
  const { month } = req.query;
  const query = {};

  if (month) {
    query.dateOfSale = { $regex: new RegExp(`-${month}-`) };
  }

  const pieChartData = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  res.status(200).json(pieChartData);
});

module.exports = router;
