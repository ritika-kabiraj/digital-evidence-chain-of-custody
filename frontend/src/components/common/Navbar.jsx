import React from 'react';
import { Shield, Wallet, LogOut, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { account, contractStatus, connectWallet } = useWeb3();

  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-card/60 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-accent via-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-glow-cyan">
          <div className="w-full h-full bg-cyber-bg rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyber-accent" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
            CHAIN<span className="text-cyber-accent">GUARD</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30">
              SOLICITOR LEDGER
            </span>
          </h1>
          <p className="text-xs text-cyber-muted">Digital Evidence & Chain of Custody System</p>
        </div>
      </div>

      {/* Right controls: Network Status, Wallet, Profile */}
      <div className="flex items-center gap-4">
        {/* Blockchain Node Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-bg border border-cyber-border text-xs font-mono">
          {contractStatus.connected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald animate-pulse" />
              <span className="text-cyber-emerald">Hardhat Local Node Active</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-cyber-amber" />
              <span className="text-cyber-amber">Simulated Ledger Relay</span>
            </>
          )}
        </div>

        {/* Wallet Connect */}
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-border/80 hover:bg-cyber-border text-white text-xs font-mono border border-cyber-border transition"
        >
          <Wallet className="w-3.5 h-3.5 text-cyber-accent" />
          <span>
            {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
          </span>
        </button>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-cyber-border">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{user.full_name}</p>
              <span className="text-[10px] text-cyber-accent uppercase tracking-wider font-mono">
                {user.role ? user.role.name : 'OFFICER'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg bg-cyber-bg hover:bg-cyber-rose/20 text-cyber-muted hover:text-cyber-rose transition border border-cyber-border"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
