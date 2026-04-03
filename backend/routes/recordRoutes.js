const express = require("express");
const { body } = require("express-validator");
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const authenticate = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const validate = require("../middleware/validate");
const { CATEGORIES } = require("../models/Record");

const router = express.Router();

router.use(authenticate);

// validation for creating (all required)
const createValidation = [
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),
  body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
  body("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("date").optional().isISO8601().withMessage("Date must be a valid date"),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

// validation for updating (all optional, but validated if present)
const updateValidation = [
  body("amount").optional().isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),
  body("type").optional().isIn(["income", "expense"]).withMessage("Type must be income or expense"),
  body("category").optional().isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("date").optional().isISO8601().withMessage("Date must be a valid date"),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

router.get("/", roleCheck("analyst", "admin"), getAllRecords);
router.get("/:id", roleCheck("analyst", "admin"), getRecordById);
router.post("/", roleCheck("admin"), createValidation, validate, createRecord);
router.put("/:id", roleCheck("admin"), updateValidation, validate, updateRecord);
router.delete("/:id", roleCheck("admin"), deleteRecord);

module.exports = router;
