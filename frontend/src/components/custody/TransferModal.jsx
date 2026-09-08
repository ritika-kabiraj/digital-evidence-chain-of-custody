import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, UserCheck, MapPin, FileText, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const TransferModal = ({ isOpen, onClose, evidence, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUserId || !reason || !location) {
      setError('Please fill in all custody transfer fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/custody/transfer', {
        evidence_id: evidence.id,
        to_user_id: targetUserId,
        reason: reason,
        location: location
      });

      onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error("Custody transfer error:", err);
      setError(err.response?.data?.detail || 'Custody transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg overflow-hidden shadow-glow-cyan">
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-bg/50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-cyber-accent" />
            <h3 className="text-lg font-bold text-white">Transfer Custody Handover</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-cyber-border text-cyber-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 text-cyber-rose text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border font-mono text-xs space-y-1">
            <p className="text-cyber-muted">Evidence Item:</p>
            <p className="text-white font-bold">{evidence.evidence_number} - {evidence.title}</p>
            <p className="text-cyber-accent text-[11px]">Current Hash: {evidence.sha256_hash.substring(0, 16)}...</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyber-accent" />
              Select Recipient Custodian *
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
              required
            >
              <option value="">-- Select Recipient Officer / Analyst --</option>
              {users
                .filter(u => u.id !== evidence.current_custodian_id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role?.name}) - {u.badge_number || u.email}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyber-accent" />
              Handover Physical / Secure Vault Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Secure Evidence Vault Room 4B / Forensic Workstation 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyber-accent" />
              Official Reason for Custody Transfer *
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Transferring disk image to Senior Forensic Specialist for deep memory artifact extraction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-cyber-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cyber-accent hover:bg-cyan-400 text-black font-bold text-sm shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Recording On Blockchain...' : 'Execute Custody Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
