"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { SshubMark } from "@/components/brand/SshubMark";
import { SshubWordmark } from "@/components/brand/SshubWordmark";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Sign-in is not configured. Set Firebase env vars on the server.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Sign-in is not configured. Set Firebase env vars on the server.");
      return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <SshubMark size={40} className="rounded-full" />
          <SshubWordmark variant="lg" />
        </Link>

        <div className="bg-brand-900/60 backdrop-blur-xl rounded-3xl border border-brand-200/10 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Sign in</h1>
          <p className="font-ui text-sm text-slate-400 mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/account/register" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-brand-900 font-ui font-semibold text-sm mb-6 hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-brand-200/10" />
            <span className="font-ui text-xs text-slate-400">or with email</span>
            <div className="flex-1 h-px bg-brand-200/10" />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-ui text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-ui text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-xl bg-brand-950/80 border border-brand-200/15 text-white placeholder:text-slate-600 font-ui text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-ui text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-brand-950/80 border border-brand-200/15 text-white placeholder:text-slate-600 font-ui text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-brand-900 font-ui font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.4 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C36.9 37.2 44 32 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Invalid email or password. Please try again.";
    case "auth/too-many-requests": return "Too many failed attempts. Please try again later.";
    case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
    default: return "Something went wrong. Please try again.";
  }
}
