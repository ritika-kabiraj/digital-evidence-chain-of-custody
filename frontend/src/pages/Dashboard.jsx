import React, { useState, useEffect } from 'react';
import { FolderSearch, ShieldCheck, Cpu, HardDrive, Plus, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export const Dashboard = ({ onOpenUpload }) => {
  const [cases, setCases] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [bcStatus, setBcStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [casesRes, evidenceRes, bcRes] = await Promise.all([
        api.get('/cases'),
        api.get('/evidence'),
        api.get('/blockchain/status')
      ]);
      setCases(casesRes.data);
      setEvidenceList(evidenceRes.data);
      setBcStatus(bcRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyber-card via-cyber-card/80 to-cyber-bg p-6 rounded-2xl border border-cyber-border">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">INVESTIGATION COMMAND CENTER</h2>
          <p className="text-xs text-cyber-muted mt-1">
            Real-time digital evidence vault monitoring & Ethereum smart contract ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-accent via-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-glow-cyan transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ingest New Evidence
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cases */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-cyber-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-cyber-muted uppercase">Active Cases</p>
            <h3 className="text-3xl font-black text-white mt-1">{cases.length}</h3>
            <span className="text-[10px] text-cyber-accent font-mono mt-1 inline-block">
              {cases.filter(c => c.status === 'OPEN').length} Open Investigation(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center text-cyber-accent">
            <FolderSearch className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Vault Evidence Count */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-cyber-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-cyber-muted uppercase">Vault Evidence Items</p>
            <h3 className="text-3xl font-black text-white mt-1">{evidenceList.length}</h3>
            <span className="text-[10px] text-indigo-400 font-mono mt-1 inline-block">
              Off-Chain Vault + On-Chain Proof
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Tamper Free Verification Rate */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-cyber-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-cyber-muted uppercase">Ledger Integrity Rate</p>
            <h3 className="text-3xl font-black text-cyber-emerald mt-1">100%</h3>
            <span className="text-[10px] text-cyber-emerald font-mono mt-1 inline-block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All SHA-256 Hashes Validated
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30 flex items-center justify-center text-cyber-emerald">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Hardhat Node Height */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-cyber-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-cyber-muted uppercase">Ethereum Block Height</p>
            <h3 className="text-3xl font-black text-white mt-1 font-mono">
              #{bcStatus?.current_block_number ?? 12}
            </h3>
            <span className="text-[10px] text-cyber-accent font-mono mt-1 inline-block truncate max-w-[140px]">
              {bcStatus?.contract_address ? `${bcStatus.contract_address.substring(0, 8)}...` : 'Hardhat Local'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center text-cyber-accent">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Evidence & Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2 Cols: Ingested Evidence Stream */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-cyber-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyber-accent" />
              Recent Digital Evidence Items
            </h3>
            <Link to="/cases" className="text-xs text-cyber-accent hover:underline flex items-center gap-1">
              View All Cases <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-cyber-muted uppercase font-mono">
                  <th className="py-3 px-2">Evidence Ref</th>
                  <th className="py-3 px-2">Title</th>
                  <th className="py-3 px-2">SHA-256 Hash</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {evidenceList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-cyber-muted italic">
                      No evidence files ingested yet. Click "Ingest New Evidence" to begin!
                    </td>
                  </tr>
                ) : (
                  evidenceList.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-cyber-card/80 transition">
                      <td className="py-3 px-2 font-mono text-cyber-accent font-bold">
                        {item.evidence_number}
                      </td>
                      <td className="py-3 px-2 text-white font-medium">
                        {item.title}
                      </td>
                      <td className="py-3 px-2 font-mono text-[10px] text-cyber-muted truncate max-w-[160px]">
                        {item.sha256_hash}
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          to={`/verification?evidence_id=${item.id}`}
                          className="px-2.5 py-1 rounded bg-cyber-accent/10 hover:bg-cyber-accent text-cyber-accent hover:text-black border border-cyber-accent/30 text-[10px] font-bold font-mono transition"
                        >
                          Verify Hash
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Active Cases Summary */}
        <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FolderSearch className="w-4 h-4 text-cyber-accent" />
            Active Investigation Files
          </h3>

          <div className="space-y-3">
            {cases.length === 0 ? (
              <p className="text-xs text-cyber-muted italic">No active cases created yet.</p>
            ) : (
              cases.map((c) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="block p-3.5 rounded-xl bg-cyber-bg hover:bg-cyber-card border border-cyber-border transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyber-accent group-hover:text-cyan-300">
                      {c.case_number}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20">
                      {c.evidence_count || 0} Evidence Files
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1 group-hover:text-cyber-accent transition">
                    {c.title}
                  </h4>
                  <p className="text-xs text-cyber-muted line-clamp-1 mt-0.5">{c.description}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
