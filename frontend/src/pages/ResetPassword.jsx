import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/client";

const FOOTER_HEADING = "SmartMeal - Your healthy meal planning companion";
const FOOTER_TAGLINE = `Eat well, live well, reduce waste ${"\u{1F331}"}`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: initialEmail,
    otp: searchParams.get("otp") || "",
    newPassword: ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRequestedRef = useRef(false);

  async function requestOtp(nextEmail = form.email) {
    setError("");
    setStatus("");

    if (!nextEmail) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.requestPasswordOtp({ email: nextEmail });
      setStatus(data.devOtp ? `${data.message} Development OTP: ${data.devOtp}` : data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialEmail || otpRequestedRef.current) return;
    otpRequestedRef.current = true;
    requestOtp(initialEmail);
  }, [initialEmail]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const data = await authApi.resetPassword(form);
      setStatus(data.message);
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <main className="auth-page">
        <section className="auth-visual" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=80"
            alt=""
          />
        </section>
        <section className="auth-form">
          <p className="eyebrow">Password Reset</p>
          <h1>Renew your SmartMeal password.</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <button type="button" className="secondary-button" onClick={requestOtp} disabled={loading}>
              Send Password OTP
            </button>
            <label>
              Email OTP
              <input
                inputMode="numeric"
                value={form.otp}
                onChange={(event) => setForm({ ...form, otp: event.target.value })}
                placeholder="6-digit code"
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                minLength={8}
                value={form.newPassword}
                onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                required
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            {status && <p className="form-status">{status}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
          <p>
            <Link to="/login">Back to login</Link>
          </p>
        </section>
      </main>
      <footer className="site-footer auth-footer">
        <p>{FOOTER_HEADING}</p>
        <p>{FOOTER_TAGLINE}</p>
      </footer>
    </div>
  );
}
