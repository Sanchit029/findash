const Record = require("../models/Record");

const createRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await Record.create({
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Record created", record });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to create record." });
  }
};

// TODO: maybe add amount range filter later (minAmount, maxAmount)
const getAllRecords = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = "date",
      order = "desc",
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    // search in notes and category
    if (search) {
      filter.$or = [
        { notes: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const records = await Record.find(filter)
      .populate("createdBy", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Record.countDocuments(filter);

    res.json({
      records,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch records." });
  }
};

const getRecordById = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id).populate("createdBy", "name email");

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.json({ record });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch record." });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    // only update fields that were actually sent
    if (amount !== undefined) record.amount = amount;
    if (type !== undefined) record.type = type;
    if (category !== undefined) record.category = category;
    if (date !== undefined) record.date = date;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.json({ message: "Record updated", record });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to update record." });
  }
};

// soft delete — marks as deleted instead of actually removing
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    record.isDeleted = true;
    await record.save();

    res.json({ message: "Record deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete record." });
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
