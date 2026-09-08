import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileCheck, Hash, ShieldAlert, Cpu } from 'lucide-react';
import api from '../../services/api';

export const UploadModal = ({ isOpen, onClose, onSuccess, initialCaseId }) => {
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(initialCaseId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DISK_IMAGE');
  const [file, setFile] = useState(null);
  const [clientHash, setClientHash] = useState('');
  const [hashing, setHashing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/cases').then(res => setCases(res.data)).catch(console.error);
      if (initialCaseId) setCaseId(initialCaseId);
    }
  }, [isOpen, initialCaseId]);

  const calculateClientSha256 = async (selectedFile) => {
    setHashing(true);
    setClientHash('');
    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setClientHash(hashHex);
    } catch (err) {
      console.error("Client side hashing failed:", err);
    } finally {
      setHashing(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      calculateClientSha256(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId || !title || !file) {
      setError('Please select a case, title, and file.');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('case_id', caseId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('file', file);

      const res = await api.post('/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSuccess(res.data);
      onClose();
      // Reset form
      setFile(null);
      setClientHash('');
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.detail || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-glow-cyan">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-bg/50">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyber-accent" />
            <h3 className="text-lg font-bold text-white">Ingest Digital Evidence</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-cyber-border text-cyber-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Case & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
                Investigation Case *
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
                required
              >
                <option value="">-- Select Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
                Evidence Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
              >
                <option value="DISK_IMAGE font-mono">DISK_IMAGE (Bit-stream copy)</option>
                <option value="NETWORK_CAPTURE">NETWORK_CAPTURE (PCAP log)</option>
                <option value="DOCUMENT">DOCUMENT (PDF/Word/Text)</option>
                <option value="MEMORY_DUMP">MEMORY_DUMP (RAM image)</option>
                <option value="MOBILE_EXTRACTION">MOBILE_EXTRACTION (Device dump)</option>
                <option value="OTHER">OTHER (Artifact binary)</option>
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
              Evidence Title / Artifact Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Server Disk Copy - Sector 0-4000"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
              Forensic Description & Seizure Notes
            </label>
            <textarea
              rows="2"
              placeholder="Seized from server rack A-12 using write blocker hardware..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
            />
          </div>

          {/* File Drag & Drop Upload */}
          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">
              Binary File Upload *
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
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                    <FileCheck className="w-4 h-4 text-cyber-emerald" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-white">Click or drag & drop evidence file here</p>
                  <p className="text-xs text-cyber-muted mt-1">Supports any forensic disk image, PCAP, or document binary</p>
                </div>
              )}
            </div>
          </div>

          {/* Client-Side SHA-256 Hash Digest Calculation Preview */}
          {(hashing || clientHash) && (
            <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-cyber-muted">
                <span className="flex items-center gap-1.5 text-cyber-accent">
                  <Hash className="w-3.5 h-3.5" />
                  Client Pre-Upload SHA-256 Digest:
                </span>
                {hashing ? <span className="text-cyber-amber animate-pulse">Calculating Hash...</span> : <span className="text-cyber-emerald">Computed ✅</span>}
              </div>
              {clientHash && (
                <p className="text-white break-all text-[11px] bg-black/40 p-2 rounded border border-cyber-border">
                  {clientHash}
                </p>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-cyber-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-cyber-border text-cyber-muted hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || hashing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-sm shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Registering on Blockchain...</span>
                </>
              ) : (
                <span>Upload & Register Hash</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
