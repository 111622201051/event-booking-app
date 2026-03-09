import { useState } from "react";

// Hardcoded credentials
const VALID_USERS = [
  { username: "admin", password: "admin123" },
  { username: "karthi", password: "karthi123" },
];

export const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    if (!password.trim()) e.password = "Password is required.";
    return e;
  };

  const handleLogin = () => {
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    const user = VALID_USERS.find(
      (u) => u.username === username.trim() && u.password === password
    );

    if (!user) {
      setAuthError("Invalid username or password.");
      return;
    }

    setAuthError("");
    onLogin(user.username);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">EventBook</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to browse and book events</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome back</h2>

          {/* Auth error */}
          {authError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-lg mb-5">
              <span>✕</span>
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your username"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.username ? "border-rose-400 bg-rose-50" : "border-gray-300"
                }`}
              />
              {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter your password"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10 ${
                    errors.password ? "border-rose-400 bg-rose-50" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200"
          >
            Sign In
          </button>

          {/* Hint */}
          <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 font-medium mb-1">Demo credentials:</p>
            <p className="text-xs text-slate-600">Username: <span className="font-mono font-semibold">admin</span> / Password: <span className="font-mono font-semibold">admin123</span></p>
            <p className="text-xs text-slate-600">Username: <span className="font-mono font-semibold">karthi</span> / Password: <span className="font-mono font-semibold">karthi123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};