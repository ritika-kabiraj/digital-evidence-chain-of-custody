import React, { useState, useEffect } from 'react';
import { History, Search, Shield, Filter, Eye, Code, Terminal, Clock } from 'lucide-react';
import api from '../services/api';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      let url = '/audit/logs?limit=100';
      if (actionFilter) url += `&action=${actionFilter}`;
      const res = await api.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter(
    (l) =>
      l.user_email.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.ip_address && l.ip_address.includes(search))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <History className="w-7 h-7 text-cyber-accent" />
          SYSTEM SECURITY AUDIT MATRIX
        </h2>
        <p className="text-xs text-cyber-muted mt-1">
          Immutable system trail capturing user authentication events, file uploads, chain-of-custody handovers, and integrity verification queries.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search audit trail by user email, action, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyber-accent shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-cyber-card border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
          >
            <option value="">-- All Security Actions --</option>
            <option value="EVIDENCE_UPLOADED">EVIDENCE_UPLOADED</option>
            <option value="CUSTODY_TRANSFERRED">CUSTODY_TRANSFERRED</option>
            <option value="EVIDENCE_VERIFICATION_SUCCESS">EVIDENCE_VERIFICATION_SUCCESS</option>
            <option value="EVIDENCE_VERIFICATION_TAMPER_DETECTED">EVIDENCE_VERIFICATION_TAMPER_DETECTED</option>
            <option value="USER_LOGIN_SUCCESS">USER_LOGIN_SUCCESS</option>
            <option value="USER_LOGIN_FAILED">USER_LOGIN_FAILED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Matrix Table */}
      <div className="glass-card rounded-2xl p-6 border border-cyber-border space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-cyber-muted uppercase">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Action Event</th>
                <th className="py-3 px-3">User Account</th>
                <th className="py-3 px-3">Client IP</th>
                <th className="py-3 px-3 text-right">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-cyber-muted italic font-sans">
                    No security audit events match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cyber-card/80 transition">
                    <td className="py-3.5 px-3 text-cyber-muted text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('SUCCESS') || log.action.includes('UPLOADED') || log.action.includes('TRANSFERRED')
                          ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30'
                          : log.action.includes('TAMPER') || log.action.includes('FAILED')
                          ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/30'
                          : 'bg-cyber-card text-white border border-cyber-border'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-white font-semibold">
                      {log.user_email}
                    </td>
                    <td className="py-3.5 px-3 text-cyber-muted">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded bg-cyber-border hover:bg-cyber-accent hover:text-black text-white text-[11px] font-mono transition inline-flex items-center gap-1"
                      >
                        <Code className="w-3 h-3" /> View JSON Payload
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg overflow-hidden shadow-glow-cyan">
            <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-bg/50">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-accent" /> Audit Payload [{selectedLog.action}]
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-cyber-muted hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <pre className="bg-black/80 p-4 rounded-xl text-cyber-accent text-xs font-mono overflow-x-auto border border-cyber-border">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
              <div className="text-right">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-cyber-border text-white text-xs font-mono"
                >
                  Close Payload Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
