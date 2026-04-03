const Record = require("../models/Record");

// aggregation to get total income, expense, balance, and count
const getSummary = async (req, res) => {
  try {
    const summary = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const data = summary[0] || { totalIncome: 0, totalExpense: 0, totalRecords: 0 };

    res.json({
      totalIncome: data.totalIncome,
      totalExpense: data.totalExpense,
      netBalance: data.totalIncome - data.totalExpense,
      totalRecords: data.totalRecords,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch summary." });
  }
};

// group by category + type
const getCategorySummary = async (req, res) => {
  try {
    const categorySummary = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // reshape so the frontend doesn't have to deal with _id nesting
    const formatted = categorySummary.map((item) => ({
      category: item._id.category,
      type: item._id.type,
      total: item.total,
      count: item.count,
    }));

    res.json({ categorySummary: formatted });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch category summary." });
  }
};

// monthly income vs expense, optionally filtered by year
const getMonthlyTrends = async (req, res) => {
  try {
    const { year } = req.query;

    const matchStage = { isDeleted: false };
    if (year) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ message: "Year must be a valid number between 2000 and 2100." });
      }
      matchStage.date = {
        $gte: new Date(`${yearNum}-01-01`),
        $lte: new Date(`${yearNum}-12-31`),
      };
    }

    const trends = await Record.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = trends.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthName: monthNames[item._id.month - 1],
      income: item.income,
      expense: item.expense,
      net: item.income - item.expense,
      count: item.count,
    }));

    res.json({ monthlyTrends: formatted });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch monthly trends." });
  }
};

// last 5 records for the dashboard quick view
const getRecentRecords = async (req, res) => {
  try {
    const records = await Record.find({ isDeleted: false })
      .populate("createdBy", "name")
      .sort({ date: -1 })
      .limit(5);

    res.json({ recentRecords: records });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch recent records." });
  }
};

module.exports = { getSummary, getCategorySummary, getMonthlyTrends, getRecentRecords };
