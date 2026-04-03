const express = require("express");
const {
  getSummary,
  getCategorySummary,
  getMonthlyTrends,
  getRecentRecords,
} = require("../controllers/dashboardController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// all dashboard routes need login, but any role can access
router.use(authenticate);

router.get("/summary", getSummary);
router.get("/category-summary", getCategorySummary);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/recent-records", getRecentRecords);

module.exports = router;
