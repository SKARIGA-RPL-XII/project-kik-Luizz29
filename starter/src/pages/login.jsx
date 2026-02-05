import { useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: panggil API login
    console.log("Login submitted");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome Back 👋</h1>
          <p className="text-white/80 mt-2">
            Silakan login ke akun Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm text-white mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div className="flex items-center justify-between text-sm text-white">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <a href="#" className="hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          Belum punya akun?{" "}
          <a href="#" className="font-semibold hover:underline">
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
}
