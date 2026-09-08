import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, UploadCloud, FileCheck, Hash, ShieldAlert, Cpu, Database } from 'lucide-react';
import api from '../services/api';
import { VerificationCard } from '../components/evidence/VerificationCard';

export const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const initialEvidenceId = searchParams.get('evidence_id') || '';

  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(initialEvidenceId);
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/evidence').then(res => setEvidenceList(res.data)).catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedEvidenceId || !file) {
      setError('Please select an evidence record and upload a file copy to verify.');
      return;
    }
    setError('');
    setVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('evidence_id', selectedEvidenceId);
      formData.append('file', file);

      const res = await api.post('/verification/verify-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.detail || 'Verification request failed');
    } finally {
      setVerifying(false);
    }
  };

  const selectedEvidence = evidenceList.find(e => e.id === selectedEvidenceId);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-cyber-accent" />
          EVIDENCE INTEGRITY VERIFICATION PORTAL
        </h2>
        <p className="text-xs text-cyber-muted mt-1">
          Perform a 3-way cryptographic SHA-256 hash comparison between local file copies, off-chain database records, and immutable Ethereum blockchain proofs.
        </p>
      </div>

      {/* Verification Form Card */}
      <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-5">
        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Evidence Record */}
          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
              Select Registered Evidence Record To Audit *
            </label>
            <select
              value={selectedEvidenceId}
              onChange={(e) => {
                setSelectedEvidenceId(e.target.value);
                setResult(null);
              }}
              className="w-full py-3 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
              required
            >
              <option value="">-- Select Evidence Item --</option>
              {evidenceList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.evidence_number} - {item.title} (SHA-256: {item.sha256_hash.substring(0, 12)}...)
                </option>
              ))}
            </select>
          </div>

          {selectedEvidence && (
            <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border font-mono text-xs space-y-1">
              <span className="text-cyber-muted block">Expected Registered SHA-256 Hash:</span>
              <p className="text-cyber-accent font-bold break-all bg-black/40 p-2 rounded border border-cyber-border">
                {selectedEvidence.sha256_hash}
              </p>
            </div>
          )}

          {/* Upload File Copy to Verify */}
          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
              Upload File Copy for Verification Audit *
            </label>
            <div className="relative border-2 border-dashed border-cyber-border hover:border-cyber-accent/50 rounded-2xl p-6 text-center bg-cyber-bg/40 transition group cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                required
              />
              <UploadCloud className="w-10 h-10 mx-auto text-cyber-accent/70 group-hover:scale-110 transition-transform mb-2" />
              {file ? (
                <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyber-emerald" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              ) : (
                <p className="text-sm font-medium text-white">Select or drop file copy to run SHA-256 verification</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying || !selectedEvidenceId || !file}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-accent via-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Comparing Cryptographic Hashes...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Execute 3-Way Hash Audit</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && <VerificationCard result={result} />}
    </div>
  );
};
