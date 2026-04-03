import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.role);
        toast.success("Registration successful!");
      } else {
        await login(formData.email, formData.password);
        toast.success("Login successful!");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>FinDash</h1>
          <p>Finance Dashboard & Access Control</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isRegister ? "Create Account" : "Sign In"}</h2>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              minLength={6}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full">
            {isRegister ? "Register" : "Login"}
          </button>

          <p className="toggle-form">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="btn-link"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </form>

        {/* Quick login buttons for testing */}
        <div className="demo-logins">
          <p>Quick Demo Login:</p>
          <div className="demo-buttons">
            <button
              className="btn btn-demo"
              onClick={() => {
                setFormData({ ...formData, email: "admin@example.com", password: "admin123" });
                setIsRegister(false);
              }}
            >
              Admin
            </button>
            <button
              className="btn btn-demo"
              onClick={() => {
                setFormData({ ...formData, email: "analyst@example.com", password: "analyst123" });
                setIsRegister(false);
              }}
            >
              Analyst
            </button>
            <button
              className="btn btn-demo"
              onClick={() => {
                setFormData({ ...formData, email: "viewer@example.com", password: "viewer123" });
                setIsRegister(false);
              }}
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
