const express = require("express");
const { body } = require("express-validator");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const authenticate = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const validate = require("../middleware/validate");

const router = express.Router();

// everything here is admin-only
router.use(authenticate, roleCheck("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);

router.patch(
  "/:id",
  [
    body("role").optional().isIn(["viewer", "analyst", "admin"]).withMessage("Role must be viewer, analyst, or admin"),
    body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  ],
  validate,
  updateUser
);

router.delete("/:id", deleteUser);

module.exports = router;
