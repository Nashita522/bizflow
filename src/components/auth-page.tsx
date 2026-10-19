"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthPageProps = {
  initialMode: "login" | "signup";
};

const features = [
  { number: "01", title: "Your customers, connected.", text: "Every relationship. One clear workspace." },
  { number: "02", title: "Billing without the busywork.", text: "Keep invoices organized and payments visible." },
  { number: "03", title: "Every booking in its place.", text: "Bring appointments and schedules together." },
  { number: "04", title: "Make room for meaningful work.", text: "Turn everyday tasks into forward momentum." },
  { number: "05", title: "Your business. In better flow.", text: "Less scattered work. More clarity every day." },
];

export default function AuthPage({ initialMode }: AuthPageProps) {
  const router = useRouter();
  const mode = initialMode;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % features.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active && session) router.replace("/");
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function switchMode(next: "login" | "signup") {
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (mode === "signup" && password !== confirmPassword) {
      setMessageType("error");
      setMessage("Your passwords do not match. Please try again.");
      return;
    }

    setBusy(true);

    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (result.error) {
        setMessageType("error");
        setMessage(result.error.message);
      } else if (mode === "signup" && !result.data.session) {
        setMessageType("success");
        setMessage("Your account has been created. Check your email to confirm it, then sign in.");
      } else if (mode === "signup") {
        setMessageType("success");
        setMessage("Account created. Opening your workspace…");
        router.replace("/");
      } else {
        router.replace("/");
      }
    } catch {
      setMessageType("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Link href="/login" className="auth-brand" aria-label="BizFlow home">
          <span className="auth-brand-mark">b.</span>
          <span>bizflow<span className="auth-brand-period">.</span></span>
        </Link>

        <div className="auth-story-content">
          <div className="auth-eyebrow">
            <span className="auth-live-dot" />
            A clearer way to run your business
          </div>

          <h1>
            Good work deserves
            <br />
            <span>a better flow.</span>
          </h1>

          <p className="auth-story-intro">
            Meet the workspace that brings your customers, invoices,
            bookings and daily work together.
          </p>

          <div className="auth-feature-window" aria-live="polite">
            <div className="auth-feature-topline">
              <span>THE BIZFLOW DIFFERENCE</span>
              <span>{String(slide + 1).padStart(2, "0")} / 05</span>
            </div>
            <div key={slide} className="auth-feature-copy">
              <span className="auth-feature-number">{features[slide].number}</span>
              <h2>{features[slide].title}</h2>
              <p>{features[slide].text}</p>
            </div>
            <div className="auth-slide-indicators" aria-label="Feature slides">
              {features.map((feature, index) => (
                <button
                  key={feature.number}
                  type="button"
                  onClick={() => setSlide(index)}
                  aria-label={`Show feature ${index + 1}`}
                  aria-current={slide === index ? "true" : undefined}
                  className={slide === index ? "active" : ""}
                />
              ))}
            </div>
          </div>

          <div className="auth-mini-dashboard" aria-hidden="true">
            <div className="auth-mini-header">
              <span className="auth-mini-logo">b.</span>
              <span className="auth-mini-label">YOUR WORKSPACE</span>
              <span className="auth-mini-status">● All in sync</span>
            </div>
            <div className="auth-mini-cards">
              <div><span>Customers</span><strong>Relationships</strong><i className="auth-mini-line line-a" /></div>
              <div><span>Invoices</span><strong>Cash flow</strong><i className="auth-mini-line line-b" /></div>
              <div><span>Bookings</span><strong>Your schedule</strong><i className="auth-mini-line line-c" /></div>
            </div>
          </div>
        </div>

        <footer className="auth-story-footer">
          <span>© 2026 BizFlow</span>
          <span>Clarity for your everyday business.</span>
        </footer>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-top">
          <span>{mode === "login" ? "Already part of BizFlow?" : "Your next chapter starts here."}</span>
          <button
            type="button"
            className="auth-top-link"
            onClick={() => {
              const next = mode === "login" ? "signup" : "login";
              router.push(next === "login" ? "/login" : "/signup");
            }}
          >
            {mode === "login" ? "Create account ↗" : "Sign in ↗"}
          </button>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">b.</span>
            <span>bizflow<span className="auth-brand-period">.</span></span>
          </div>

          <div className="auth-form-heading">
            <div className="auth-form-kicker">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </div>
            <h2>{mode === "login" ? "Good to see you." : "Make yourself at home."}</h2>
            <p>
              {mode === "login"
                ? "Sign in to pick up where your business left off."
                : "Create your account and bring your work into focus."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="auth-email">Email address</label>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
                <path d="m5 7 7 5.5L19 7" />
              </svg>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="auth-password-label">
              <label htmlFor="auth-password">Password</label>
              {mode === "login" && (
                <span className="auth-password-hint">At least 6 characters</span>
              )}
            </div>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v2" />
              </svg>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="auth-show-password"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {mode === "signup" && (
              <>
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <div className="auth-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="m9 15 2 2 4-4" />
                  </svg>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="Enter your password again"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </>
            )}

            {message && (
              <div
                role="status"
                className={`auth-message ${messageType === "success" ? "success" : "error"}`}
              >
                <span>{messageType === "success" ? "✓" : "!"}</span>
                <p>{message}</p>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={busy}>
              <span>{busy ? "Please wait…" : mode === "login" ? "Sign in to BizFlow" : "Create your account"}</span>
              {!busy && <span className="auth-submit-arrow">↗</span>}
            </button>
          </form>

          <div className="auth-divider"><span>BUILT FOR YOUR BUSINESS</span></div>

          <div className="auth-trust">
            <span className="auth-trust-icon">✳</span>
            <p>
              One thoughtful workspace for your everyday operations.
              <strong> Simple by design.</strong>
            </p>
          </div>

          <p className="auth-terms">
            By continuing, you agree to use BizFlow responsibly.
            Your workspace is tied to your account.
          </p>
        </div>

        <footer className="auth-form-footer">
          <span>© 2026 BizFlow</span>
          <span>Made for better business days <span aria-hidden="true">✳</span></span>
        </footer>
      </section>
    </main>
  );
}
