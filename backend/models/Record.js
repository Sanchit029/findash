const mongoose = require("mongoose");

const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Food",
  "Rent",
  "Utilities",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Type (income/expense) is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: CATEGORIES,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// indexes for the fields we query/filter on a lot
recordSchema.index({ date: -1 });
recordSchema.index({ type: 1, category: 1 });
recordSchema.index({ createdBy: 1 });
recordSchema.index({ isDeleted: 1, date: -1 });

// filter out soft-deleted records automatically
recordSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
});

module.exports = mongoose.model("Record", recordSchema);
module.exports.CATEGORIES = CATEGORIES;
