import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderSearch, Plus, HardDrive, ShieldCheck, ArrowLeft, Download, Eye, FileText, User } from 'lucide-react';
import api from '../services/api';

export const CaseDetailPage = ({ onOpenUpload }) => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        api.get(`/cases/${caseId}`),
        api.get(`/evidence?case_id=${caseId}`)
      ]);
      setCaseData(cRes.data);
      setEvidenceList(eRes.data);
    } catch (err) {
      console.error("Fetch case detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [caseId]);

  if (loading) {
    return <div className="p-12 text-center font-mono text-cyber-accent animate-pulse">Loading case file...</div>;
  }

  if (!caseData) {
    return <div className="p-12 text-center text-cyber-rose font-mono">Case file not found.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link to="/cases" className="inline-flex items-center gap-2 text-xs font-mono text-cyber-muted hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Case Inventory
      </Link>

      {/* Case Header Card */}
      <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-cyber-accent bg-cyber-accent/10 px-3 py-1 rounded border border-cyber-accent/30">
                {caseData.case_number}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30">
                {caseData.status}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">{caseData.title}</h2>
          </div>

          <button
            onClick={() => onOpenUpload(caseData.id)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-glow-cyan transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ingest Evidence To Case
          </button>
        </div>

        <p className="text-sm text-cyber-muted">{caseData.description}</p>

        <div className="pt-4 border-t border-cyber-border/60 flex flex-wrap items-center gap-6 text-xs text-cyber-muted font-mono">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-cyber-accent" />
            <span>Lead Investigator: <strong className="text-white">{caseData.lead_investigator?.full_name || caseData.created_by?.full_name}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Registered Evidence Items: <strong className="text-white">{evidenceList.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Evidence Items Inventory Table */}
      <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyber-accent" />
          Case Digital Evidence Inventory ({evidenceList.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-cyber-muted uppercase font-mono">
                <th className="py-3 px-3">Evidence Number</th>
                <th className="py-3 px-3">Title & Category</th>
                <th className="py-3 px-3">SHA-256 Fingerprint</th>
                <th className="py-3 px-3">Custodian</th>
                <th className="py-3 px-3">Blockchain Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {evidenceList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-cyber-muted italic">
                    No evidence items registered for this case yet. Click "Ingest Evidence To Case" to add files.
                  </td>
                </tr>
              ) : (
                evidenceList.map((item) => (
                  <tr key={item.id} className="hover:bg-cyber-card/80 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-cyber-accent">
                      {item.evidence_number}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-white font-medium">{item.title}</p>
                      <span className="text-[10px] font-mono text-cyber-muted uppercase">{item.category}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-cyber-muted">
                      <span className="bg-black/40 px-2 py-1 rounded border border-cyber-border inline-block max-w-[180px] truncate">
                        {item.sha256_hash}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-white font-medium">
                      {item.current_custodian?.full_name || 'Assigned Officer'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30">
                        ANCHOred ON-CHAIN
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <Link
                        to={`/evidence/${item.id}`}
                        className="px-2.5 py-1.5 rounded bg-cyber-border hover:bg-cyber-accent hover:text-black text-white text-[11px] font-mono transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Detail & Chain
                      </Link>
                      <Link
                        to={`/verification?evidence_id=${item.id}`}
                        className="px-2.5 py-1.5 rounded bg-cyber-accent/10 hover:bg-cyber-accent text-cyber-accent hover:text-black border border-cyber-accent/30 text-[11px] font-mono font-bold transition inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" /> Verify Hash
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
