import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import LoadingScreen from "./LoadingScreen";
import logo from "../../public/LH_Large.png"; // update if needed

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCheckingAdmin(true);

    const auth = getAuth(app);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await userCred.user.getIdToken(true);

      let tries = 0;
      const checkAdmin = async () => {
        const refreshedToken = await userCred.user.getIdTokenResult(true);
        if (refreshedToken.claims.admin) {
          setCheckingAdmin(false);
          navigate("/dashboard");
        } else if (tries < 10) {
          tries++;
          setTimeout(checkAdmin, 200);
        } else {
          setCheckingAdmin(false);
          setError("Access denied. Admins only.");
        }
      };
      checkAdmin();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setCheckingAdmin(false);
      setError("Login failed. " + (err?.message || ""));
    }
  };

  if (checkingAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Laundry Hub Logo" className="mb-2" />

          <span className="text-gray-500 text-sm">Admin Login</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            autoComplete="username"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-blue-700"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Hide icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.58-9-8a8.978 8.978 0 012.788-6.442M4.22 4.22l15.56 15.56M15.78 15.78a2.992 2.992 0 01-4.243 0m6.363-6.364A9 9 0 0021 11c0 4.42-4 8-9 8a9.001 9.001 0 01-7.938-4.94"
                  />
                </svg>
              ) : (
                // Show icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.418-4 8-9 8s-9-3.582-9-8 4-8 9-8 9 3.582 9 8z"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={checkingAdmin}
            className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition"
          >
            {checkingAdmin ? "Checking access..." : "Login"}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
        )}
      </div>
      <span className="mt-6 text-gray-400 text-xs">
        © {new Date().getFullYear()} The Laundry Hub SF
      </span>
    </div>
  );
};

export default Login;
