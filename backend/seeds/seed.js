const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Record = require("../models/Record");

dotenv.config();

const sampleUsers = [
  { name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
  { name: "Analyst User", email: "analyst@example.com", password: "analyst123", role: "analyst" },
  { name: "Viewer User", email: "viewer@example.com", password: "viewer123", role: "viewer" },
];

const generateRecords = (adminId) => {
  const records = [];
  const incomeCategories = ["Salary", "Freelance", "Investment"];
  const expenseCategories = ["Food", "Rent", "Utilities", "Transport", "Entertainment", "Healthcare", "Shopping", "Education"];

  for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);

    incomeCategories.forEach((category) => {
      records.push({
        amount: Math.floor(Math.random() * 50000) + 10000,
        type: "income",
        category,
        date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1),
        notes: `${category} income for ${date.toLocaleString("default", { month: "long" })}`,
        createdBy: adminId,
      });
    });

    // pick 4-5 random expense categories per month
    const shuffled = expenseCategories.sort(() => 0.5 - Math.random());
    const selectedExpenses = shuffled.slice(0, 4 + Math.floor(Math.random() * 2));

    selectedExpenses.forEach((category) => {
      records.push({
        amount: Math.floor(Math.random() * 15000) + 500,
        type: "expense",
        category,
        date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1),
        notes: `${category} expense for ${date.toLocaleString("default", { month: "long" })}`,
        createdBy: adminId,
      });
    });
  }

  return records;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await User.deleteMany({});
    await Record.deleteMany({});
    console.log("Cleared existing data.");

    const createdUsers = await User.create(sampleUsers);
    const adminUser = createdUsers.find((u) => u.role === "admin");
    console.log(`Created ${createdUsers.length} users.`);

    const records = generateRecords(adminUser._id);
    await Record.insertMany(records);
    console.log(`Created ${records.length} financial records.`);

    console.log("\n--- Seed Complete ---");
    console.log("Login credentials:");
    console.log("  Admin:   admin@example.com   / admin123");
    console.log("  Analyst: analyst@example.com / analyst123");
    console.log("  Viewer:  viewer@example.com  / viewer123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
