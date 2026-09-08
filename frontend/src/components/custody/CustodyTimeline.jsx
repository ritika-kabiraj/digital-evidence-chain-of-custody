import React from 'react';
import { Shield, Clock, MapPin, User, ArrowRight, Link, CheckCircle } from 'lucide-react';

export const CustodyTimeline = ({ transfers, initialSubmitter }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-accent" />
          Immutable Chain of Custody History
        </h4>
        <span className="text-xs font-mono text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/30 px-2.5 py-1 rounded-full">
          {transfers.length + 1} Total Handover Log Entries
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyber-accent before:via-indigo-500 before:to-cyber-border">
        {/* Initial Intake Step */}
        <div className="relative group">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-cyber-accent border-4 border-cyber-bg shadow-glow-cyan flex items-center justify-center" />
          <div className="glass-card rounded-xl p-4 space-y-2 border-l-4 border-l-cyber-accent">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border/60 pb-2">
              <span className="text-xs font-mono font-bold text-cyber-accent bg-cyber-accent/10 px-2 py-0.5 rounded">
                STEP #1 • INITIAL EVIDENCE SEIZURE & ON-CHAIN INTAKE
              </span>
              <span className="text-xs text-cyber-muted flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                Intake Completed
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-white">
              <User className="w-4 h-4 text-cyber-accent" />
              <span>Submitting Officer: <strong className="text-cyber-accent">{initialSubmitter?.full_name || 'Authorized Investigator'}</strong></span>
            </div>

            <p className="text-xs text-cyber-muted italic">
              Initial file SHA-256 hash snapshot captured & anchored to Ethereum smart contract.
            </p>
          </div>
        </div>

        {/* Subsequent Transfer Steps */}
        {transfers.map((tx, idx) => (
          <div key={tx.id || idx} className="relative group">
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-500 border-4 border-cyber-bg flex items-center justify-center" />
            <div className="glass-card rounded-xl p-4 space-y-3 border-l-4 border-l-indigo-500 hover:border-l-cyber-accent transition">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border/60 pb-2">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  STEP #{idx + 2} • CUSTODY HANDOVER
                </span>
                <span className="text-xs text-cyber-muted flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(tx.transferred_at).toLocaleString()}
                </span>
              </div>

              {/* Handover Flow */}
              <div className="flex items-center gap-3 text-sm font-semibold text-white bg-cyber-bg/60 p-3 rounded-lg border border-cyber-border">
                <span className="text-cyber-muted">{tx.from_user?.full_name || 'Previous Custodian'}</span>
                <ArrowRight className="w-4 h-4 text-cyber-accent shrink-0" />
                <span className="text-cyber-emerald">{tx.to_user?.full_name || 'Recipient Officer'}</span>
              </div>

              {/* Reason & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-1.5 text-cyber-muted">
                  <MapPin className="w-3.5 h-3.5 text-cyber-accent shrink-0 mt-0.5" />
                  <span>Location: <strong className="text-white">{tx.location}</strong></span>
                </div>
                <div className="text-cyber-muted">
                  <span>Reason: <em className="text-white font-sans">{tx.reason}</em></span>
                </div>
              </div>

              {/* On-Chain Transaction Hash Receipt */}
              {tx.tx_hash && (
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-cyber-muted flex items-center gap-1">
                    <Link className="w-3 h-3 text-cyber-accent" />
                    Blockchain Tx Ref:
                  </span>
                  <span className="text-cyber-accent bg-black/40 px-2 py-0.5 rounded border border-cyber-border truncate max-w-[280px]">
                    {tx.tx_hash}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
