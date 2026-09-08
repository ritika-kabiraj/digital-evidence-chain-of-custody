import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyber-accent via-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan">
            <div className="w-full h-full bg-cyber-bg rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyber-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            CHAINGUARD <span className="text-cyber-accent">EVIDENCE LEDGER</span>
          </h1>
          <p className="text-xs text-cyber-muted font-mono">
            Blockchain Digital Evidence Integrity & Custody Management
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="investigator@evidence.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-accent via-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-sm shadow-glow-cyan transition flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In To Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-cyber-border space-y-2">
            <p className="text-[11px] font-mono text-cyber-muted flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-cyber-accent" />
              Quick Demo Account Presets:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoAccount('admin@evidence.gov', 'AdminPassword123!')}
                className="py-1.5 px-2 rounded-lg bg-cyber-bg hover:bg-cyber-border border border-cyber-border text-white text-left font-mono truncate"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccount('investigator@evidence.gov', 'Investigator123!')}
                className="py-1.5 px-2 rounded-lg bg-cyber-bg hover:bg-cyber-border border border-cyber-border text-white text-left font-mono truncate"
              >
                🔍 Lead Investigator
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccount('analyst@evidence.gov', 'Analyst123!')}
                className="py-1.5 px-2 rounded-lg bg-cyber-bg hover:bg-cyber-border border border-cyber-border text-white text-left font-mono truncate"
              >
                🔬 Forensic Specialist
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccount('auditor@evidence.gov', 'Auditor123!')}
                className="py-1.5 px-2 rounded-lg bg-cyber-bg hover:bg-cyber-border border border-cyber-border text-white text-left font-mono truncate"
              >
                ⚖️ Prosecutor Auditor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
