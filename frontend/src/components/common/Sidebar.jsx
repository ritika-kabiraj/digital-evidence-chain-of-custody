import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderSearch, ShieldCheck, FileKey, History, FilePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ onOpenUpload }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases & Investigation', icon: FolderSearch },
    { to: '/verification', label: 'Integrity Verification', icon: ShieldCheck },
    { to: '/audit-logs', label: 'Audit Log Matrix', icon: History },
  ];

  const canUpload = user && ['ADMIN', 'LEAD_INVESTIGATOR', 'FORENSIC_ANALYST'].includes(user.role?.name);

  return (
    <aside className="w-64 border-r border-cyber-border bg-cyber-card/40 backdrop-blur-md flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Quick Action Upload Button */}
        {canUpload && (
          <button
            onClick={onOpenUpload}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyber-accent via-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-semibold text-sm shadow-glow-cyan transition flex items-center justify-center gap-2 group"
          >
            <FilePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Ingest Digital Evidence</span>
          </button>
        )}

        {/* Nav links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 shadow-glow-cyan'
                      : 'text-cyber-muted hover:text-white hover:bg-cyber-card'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role & Storage Stats Widget */}
      <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyber-muted">Vault Storage</span>
          <span className="text-cyber-emerald font-mono font-bold">SECURE (LOCAL)</span>
        </div>
        <div className="w-full bg-cyber-card h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyber-accent h-full w-[24%]" />
        </div>
        <p className="text-[10px] text-cyber-muted font-mono">
          SHA-256 Digest • Ethereum Hardhat Ledger
        </p>
      </div>
    </aside>
  );
};
