const User = require("../models/User");

// list all users with optional filters (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

const updateUser = async (req, res) => {
  try {
    const { role, isActive, name } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // don't let admin deactivate themselves lol
    if (req.user._id.toString() === req.params.id && isActive === false) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (name !== undefined) user.name = name;

    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to update user." });
  }
};

// soft delete — just deactivates the account
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: "User deactivated successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
