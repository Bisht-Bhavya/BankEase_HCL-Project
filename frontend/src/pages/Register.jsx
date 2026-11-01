import api from "../services/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShieldCheck,
  ArrowRight,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/users", {
        name,
        email,
        password,
        phone: phoneNumber,
        dateOfBirth: dob,
      });

      console.log("Registration successful:", response.data);
      setSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
        {success && (
          <div className="success-overlay">
            <div className="success-modal">
              <button
                className="success-close"
                onClick={() => setSuccess(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="success-icon">
                <CheckCircle2 size={42} />
              </div>

              <h2>Registration Successful!</h2>

              <p>
                Your BankEase account has been created successfully.
                You can now sign in to your account.
              </p>

              <button
                className="success-button"
                onClick={() => {
                  navigate("/login");
                }}
              >
                Continue to Login
              </button>
            </div>
          </div>
        )}
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
            Start your
            <br />
            financial
            <br />
            <span>journey.</span>
          </h1>
          <p>
            Create your BankEase account and experience
            smarter, simpler and more secure banking.
          </p>

          <div className="security-note">
            <ShieldCheck size={21} />
            <div>
              <strong>Your security matters</strong>
              <span>Your information is handled securely.</span>
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
            <span className="welcome-label">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Fill in your details to join BankEase.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className="modern-input">
                <UserRound size={19} />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <div className="modern-input">
                <input
                  id="dob"
                  type="date"
                  autoComplete="bday"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="modern-input">
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="modern-input">
                <LockKeyhole size={19} />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
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
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="form-divider">
            <span>ALREADY REGISTERED?</span>
          </div>

          <p className="register-text">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
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

export default Register;
