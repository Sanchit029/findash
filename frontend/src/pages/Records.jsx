import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// keep in sync with backend Record model
const CATEGORIES = [
  "Salary", "Freelance", "Investment", "Food", "Rent", "Utilities",
  "Transport", "Entertainment", "Healthcare", "Shopping", "Education", "Other",
];

function Records() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    search: "",
    page: 1,
  });

  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const res = await axios.get("/api/records", { params });
      setRecords(res.data.records);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormData({
      amount: "",
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().split("T")[0],
      notes: record.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await axios.put(`/api/records/${editingRecord._id}`, formData);
        toast.success("Record updated!");
      } else {
        await axios.post("/api/records", formData);
        toast.success("Record created!");
      }
      setShowModal(false);
      fetchRecords();
    } catch (error) {
      const message = error.response?.data?.message || "Operation failed";
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`/api/records/${id}`);
      toast.success("Record deleted!");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading records...</div>;

  return (
    <div className="records-page">
      <div className="page-header">
        <h1>Financial Records</h1>
        {user.role === "admin" && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add Record
          </button>
        )}
      </div>

      <div className="filters card">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search notes or category..."
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Type:</label>
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Created By</th>
              {user.role === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>
                  <span className={`type-badge ${record.type}`}>{record.type}</span>
                </td>
                <td>{record.category}</td>
                <td className={record.type === "income" ? "text-green" : "text-red"}>
                  {record.type === "income" ? "+" : "-"}{formatCurrency(record.amount)}
                </td>
                <td className="notes-cell">{record.notes || "-"}</td>
                <td>{record.createdBy?.name || "Unknown"}</td>
                {user.role === "admin" && (
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => openEditModal(record)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(record._id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={user.role === "admin" ? 7 : 6} className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRecord ? "Edit Record" : "Add New Record"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Records;
