import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HardDrive, ShieldCheck, ArrowRightLeft, Download, ArrowLeft, Cpu, Hash, MapPin, User, FileCheck, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { CustodyTimeline } from '../components/custody/CustodyTimeline';
import { TransferModal } from '../components/custody/TransferModal';

export const EvidenceDetailPage = () => {
  const { evidenceId } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const fetchEvidenceDetails = async () => {
    try {
      const [eRes, tRes] = await Promise.all([
        api.get(`/evidence/${evidenceId}`),
        api.get(`/custody/${evidenceId}/history`)
      ]);
      setEvidence(eRes.data);
      setTransfers(tRes.data);
    } catch (err) {
      console.error("Fetch evidence detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidenceDetails();
  }, [evidenceId]);

  const handleDownload = () => {
    const token = localStorage.getItem('token');
    const downloadUrl = `http://localhost:8000/api/v1/evidence/${evidenceId}/download`;
    // Trigger download with auth token header or new window
    window.open(`${downloadUrl}?token=${token}`, '_blank');
  };

  if (loading) {
    return <div className="p-12 text-center font-mono text-cyber-accent animate-pulse">Fetching evidence details...</div>;
  }

  if (!evidence) {
    return <div className="p-12 text-center text-cyber-rose font-mono">Evidence record not found.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to={`/cases/${evidence.case_id}`} className="inline-flex items-center gap-2 text-xs font-mono text-cyber-muted hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Case File
      </Link>

      {/* Main Evidence Header Panel */}
      <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-cyber-accent bg-cyber-accent/10 px-3 py-1 rounded border border-cyber-accent/30">
                {evidence.evidence_number}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30">
                STATUS: {evidence.status}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">{evidence.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-xl bg-cyber-border hover:bg-cyber-card text-white font-semibold text-xs transition flex items-center gap-2 border border-cyber-border"
            >
              <Download className="w-4 h-4 text-cyber-accent" />
              Download Vault Copy
            </button>

            <Link
              to={`/verification?evidence_id=${evidence.id}`}
              className="py-2.5 px-4 rounded-xl bg-cyber-emerald/20 hover:bg-cyber-emerald hover:text-black text-cyber-emerald font-bold text-xs border border-cyber-emerald/40 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify SHA-256 Hash
            </Link>

            <button
              onClick={() => setIsTransferOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-glow-cyan transition flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Initiate Custody Transfer
            </button>
          </div>
        </div>

        {/* SHA-256 Fingerprint & Metadata Grid */}
        <div className="p-4 rounded-xl bg-cyber-bg/80 border border-cyber-border space-y-3 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-cyber-border/60 pb-3">
            <span className="text-cyber-accent font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4" /> SHA-256 Fingerprint Digest:
            </span>
            <span className="text-white break-all text-[11px] bg-black/60 px-3 py-1.5 rounded border border-cyber-border">
              {evidence.sha256_hash}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div>
              <span className="text-cyber-muted block">File Name & Size:</span>
              <span className="text-white font-semibold">{evidence.file_name} ({(evidence.file_size_bytes / 1024).toFixed(1)} KB)</span>
            </div>
            <div>
              <span className="text-cyber-muted block">Category:</span>
              <span className="text-white font-semibold">{evidence.category}</span>
            </div>
            <div>
              <span className="text-cyber-muted block">Current Custodian:</span>
              <span className="text-cyber-accent font-semibold">{evidence.current_custodian?.full_name || 'Assigned Officer'}</span>
            </div>
            <div>
              <span className="text-cyber-muted block">Off-Chain Storage Reference:</span>
              <span className="text-white font-semibold truncate block max-w-[200px]">{evidence.storage_path}</span>
            </div>
          </div>
        </div>

        {/* Ethereum Smart Contract Receipt Box */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-indigo-400 font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Ethereum Hardhat Ledger Reference
            </span>
            <span className="text-[10px] text-cyber-emerald bg-cyber-emerald/10 px-2 py-0.5 rounded border border-cyber-emerald/30">
              BLOCK #{evidence.blockchain_block_number || 1}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-cyber-muted">
            <span>Transaction Hash:</span>
            <span className="text-white text-[11px] bg-black/40 px-2.5 py-1 rounded border border-cyber-border truncate max-w-[360px]">
              {evidence.blockchain_tx_hash || '0x7a3f892c...'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chain of Custody Timeline */}
      <div className="glass-card rounded-2xl p-6 border border-cyber-border">
        <CustodyTimeline transfers={transfers} initialSubmitter={evidence.current_custodian} />
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        evidence={evidence}
        onSuccess={() => {
          fetchEvidenceDetails();
        }}
      />
    </div>
  );
};
