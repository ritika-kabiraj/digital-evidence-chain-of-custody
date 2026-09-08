import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Database, Cpu, Hash } from 'lucide-react';

export const VerificationCard = ({ result }) => {
  if (!result) return null;

  const isSuccess = result.is_fully_tamper_free;

  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 ${
      isSuccess
        ? 'bg-cyber-emerald/10 border-cyber-emerald/40 shadow-glow-emerald'
        : 'bg-cyber-rose/10 border-cyber-rose/40 shadow-glow-rose animate-pulse'
    }`}>
      {/* Banner status */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isSuccess ? 'bg-cyber-emerald/20 text-cyber-emerald' : 'bg-cyber-rose/20 text-cyber-rose'
        }`}>
          {isSuccess ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {isSuccess ? 'EVIDENCE INTEGRITY VERIFIED' : 'CRITICAL INTEGRITY TAMPER ALERT'}
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold ${
              isSuccess ? 'bg-cyber-emerald text-black' : 'bg-cyber-rose text-white'
            }`}>
              {isSuccess ? '100% MATCH' : 'HASH MISMATCH'}
            </span>
          </h3>
          <p className="text-sm text-cyber-muted mt-1">
            {isSuccess
              ? 'The uploaded file SHA-256 fingerprint matches both the official Database record and the immutable Ethereum Blockchain Ledger.'
              : 'CRITICAL ALERT: The computed SHA-256 fingerprint of this file copy DOES NOT match the recorded on-chain ledger hash! File has been altered or corrupted.'}
          </p>
        </div>
      </div>

      {/* Detailed 3-Way Hash Comparison Table */}
      <div className="space-y-3 font-mono text-xs">
        {/* Row 1: Uploaded File Computed Hash */}
        <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyber-accent font-semibold">
            <Hash className="w-4 h-4" />
            <span>1. Uploaded File Hash (Computed Now):</span>
          </div>
          <span className="text-white break-all text-[11px] bg-black/40 px-2 py-1 rounded border border-cyber-border">
            {result.calculated_hash}
          </span>
        </div>

        {/* Row 2: Database Stored Hash */}
        <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyber-muted font-semibold">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>2. Database Record Hash:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white break-all text-[11px] bg-black/40 px-2 py-1 rounded border border-cyber-border">
              {result.db_hash}
            </span>
            {result.db_match ? (
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-cyber-rose shrink-0" />
            )}
          </div>
        </div>

        {/* Row 3: Smart Contract Ledger Hash */}
        <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyber-muted font-semibold">
            <Cpu className="w-4 h-4 text-cyber-accent" />
            <span>3. Blockchain Smart Contract Hash:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white break-all text-[11px] bg-black/40 px-2 py-1 rounded border border-cyber-border">
              {result.blockchain_hash || result.db_hash}
            </span>
            {result.blockchain_match ? (
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-cyber-rose shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
