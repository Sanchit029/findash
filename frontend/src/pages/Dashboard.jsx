import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, categoryRes, monthlyRes, recentRes] = await Promise.all([
        axios.get("/api/dashboard/summary"),
        axios.get("/api/dashboard/category-summary"),
        axios.get("/api/dashboard/monthly-trends"),
        axios.get("/api/dashboard/recent-records"),
      ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data.categorySummary);
      setMonthlyData(monthlyRes.data.monthlyTrends);
      setRecentRecords(recentRes.data.recentRecords);
    } catch (error) {
      console.error("Failed to load dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPieData = () => {
    const grouped = {};
    categoryData.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = 0;
      grouped[item.category] += item.total;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className="summary-cards">
        <div className="card summary-card income">
          <h3>Total Income</h3>
          <p className="amount">{formatCurrency(summary?.totalIncome || 0)}</p>
        </div>
        <div className="card summary-card expense">
          <h3>Total Expenses</h3>
          <p className="amount">{formatCurrency(summary?.totalExpense || 0)}</p>
        </div>
        <div className="card summary-card balance">
          <h3>Net Balance</h3>
          <p className="amount">{formatCurrency(summary?.netBalance || 0)}</p>
        </div>
        <div className="card summary-card records">
          <h3>Total Records</h3>
          <p className="amount">{summary?.totalRecords || 0}</p>
        </div>
      </div>


      <div className="charts-grid">

        <div className="card chart-card">
          <h3>Monthly Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        <div className="card chart-card">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPieData()}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {getPieData().map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>


        <div className="card chart-card">
          <h3>Net Balance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="net" stroke="#4f46e5" name="Net Balance" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>


        <div className="card chart-card">
          <h3>Recent Transactions</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.category}</td>
                  <td>
                    <span className={`type-badge ${record.type}`}>{record.type}</span>
                  </td>
                  <td className={record.type === "income" ? "text-green" : "text-red"}>
                    {record.type === "income" ? "+" : "-"}{formatCurrency(record.amount)}
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
