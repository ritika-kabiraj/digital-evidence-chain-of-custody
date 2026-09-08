import React, { useState, useEffect } from 'react';
import { FolderSearch, Plus, Search, Shield, User, Clock, ArrowRight, X } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CasesPage = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCases = async () => {
    try {
      const res = await api.get('/cases');
      setCases(res.data);
    } catch (err) {
      console.error("Fetch cases failed:", err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/cases', {
        case_number: caseNumber,
        title: title,
        description: description,
        status: 'OPEN'
      });
      setIsCreateOpen(false);
      setCaseNumber('');
      setTitle('');
      setDescription('');
      fetchCases();
    } catch (err) {
      console.error("Create case error:", err);
      setError(err.response?.data?.detail || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderSearch className="w-6 h-6 text-cyber-accent" />
            INVESTIGATION CASES
          </h2>
          <p className="text-xs text-cyber-muted mt-0.5">
            Active digital forensics case files and registered evidence inventories.
          </p>
        </div>

        {user && ['ADMIN', 'LEAD_INVESTIGATOR'].includes(user.role?.name) && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-cyber-accent hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-glow-cyan transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Investigation Case
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-cyber-muted absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by case reference number or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-cyber-card border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
        />
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.map((c) => (
          <Link
            key={c.id}
            to={`/cases/${c.id}`}
            className="glass-card glass-card-hover rounded-2xl p-5 border border-cyber-border flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyber-accent bg-cyber-accent/10 px-2.5 py-0.5 rounded border border-cyber-accent/20">
                  {c.case_number}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30">
                  {c.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyber-accent transition">
                {c.title}
              </h3>
              <p className="text-xs text-cyber-muted line-clamp-2">{c.description || 'No detailed description'}</p>
            </div>

            <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs text-cyber-muted font-mono">
              <span>{c.evidence_count || 0} Evidence Item(s)</span>
              <span className="text-cyber-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Case <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Case Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg overflow-hidden shadow-glow-cyan">
            <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-bg/50">
              <h3 className="text-lg font-bold text-white">Create Investigation Case</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-cyber-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-cyber-rose/10 text-cyber-rose text-xs">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-1">
                  Case Reference Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CASE-2026-X89"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operation Cyber-Shield Server Intrusion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-1">
                  Case Description & Briefing
                </label>
                <textarea
                  rows="3"
                  placeholder="Details regarding incident scope, target hosts, seized assets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-sm focus:border-cyber-accent focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-cyber-accent text-black font-bold text-sm shadow-glow-cyan"
                >
                  {loading ? 'Creating...' : 'Initialize Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
