import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import {
  Wallet,
  ShieldCheck,
  ArrowRight,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import heroImage from "../assets/hero.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { token, userid, name, email: userEmail, tokenType } =
        response.data;

      // Store login session
      sessionStorage.setItem("token", token);

      sessionStorage.setItem(
        "user",
        JSON.stringify({
          userid,
          name,
          email: userEmail,
          tokenType,
        })
      );

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-logo">
          <div className="brand-icon">
            <Wallet size={25} />
          </div>
          <span>BankEase</span>
        </div>

        <div className="brand-content">
          <span className="brand-tagline">BANKING, SIMPLIFIED</span>
          <h1>
            Your money.
            <br />
            Your future.
            <br />
            <span>Your control.</span>
          </h1>

          <p>
            Experience smarter banking with a secure, simple
            and seamless way to manage your finances.
          </p>

          <div className="security-note">
            <ShieldCheck size={21} />
            <div>
              <strong>Security you can trust</strong>
              <span>Your financial information stays protected.</span>
            </div>
          </div>
        </div>

        <img className="brand-illustration" src={heroImage} alt="" />

        <div className="brand-footer">
          © 2026 BankEase. All rights reserved.
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-container">
          <div className="mobile-brand">
            <Wallet size={25} />
            <span>BankEase</span>
          </div>

          <div className="form-heading">
            <span className="welcome-label">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="modern-input">
                <Mail size={19} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="modern-input">
                <LockKeyhole size={19} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-alert" role="alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="form-divider">
            <span>NEW TO BANKEASE?</span>
          </div>

          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>

          <div className="form-security">
            <ShieldCheck size={17} />
            <span>Secure access to your banking account</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
