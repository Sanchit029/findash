import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users", { params: { page, limit: 10 } });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/users/${userId}`, { role: newRole });
      toast.success("Role updated!");
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update role";
      toast.error(message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`/api/users/${userId}`, { isActive: !currentStatus });
      toast.success(`User ${currentStatus ? "deactivated" : "activated"}!`);
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update status";
      toast.error(message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      toast.success("User deactivated!");
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to deactivate user";
      toast.error(message);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage user roles and access permissions</p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className={!u.isActive ? "inactive-row" : ""}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${u.isActive ? "active" : "inactive"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    className={`btn btn-sm ${u.isActive ? "btn-warning" : "btn-success"}`}
                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  {u.isActive && (
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(u._id)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
