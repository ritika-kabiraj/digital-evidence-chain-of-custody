import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { UploadModal } from './components/evidence/UploadModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { EvidenceDetailPage } from './pages/EvidenceDetailPage';
import { VerificationPage } from './pages/VerificationPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const ProtectedLayout = ({ children, onOpenUpload }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center font-mono text-cyber-accent animate-pulse">
        Authenticating Agent Credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenUpload={() => onOpenUpload()} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCaseId, setUploadCaseId] = useState('');

  const handleOpenUpload = (caseId = '') => {
    setUploadCaseId(caseId);
    setIsUploadOpen(true);
  };

  return (
    <AuthProvider>
      <Web3Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedLayout onOpenUpload={handleOpenUpload}>
                  <Dashboard onOpenUpload={() => handleOpenUpload()} />
                </ProtectedLayout>
              }
            />

            <Route
              path="/cases"
              element={
                <ProtectedLayout onOpenUpload={handleOpenUpload}>
                  <CasesPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/cases/:caseId"
              element={
                <ProtectedLayout onOpenUpload={handleOpenUpload}>
                  <CaseDetailPage onOpenUpload={(id) => handleOpenUpload(id)} />
                </ProtectedLayout>
              }
            />

            <Route
              path="/evidence/:evidenceId"
              element={
                <ProtectedLayout onOpenUpload={handleOpenUpload}>
                  <EvidenceDetailPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/verification"
              element={
                <ProtectedLayout onOpenUpload={handleOpenUpload}>
                  <VerificationPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedLayout onOpenUpload={handleOpenUpload}>
                  <AuditLogsPage />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Global Ingest Evidence Modal */}
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            initialCaseId={uploadCaseId}
            onSuccess={(newEvidence) => {
              // Optionally trigger global refresh
            }}
          />
        </BrowserRouter>
      </Web3Provider>
    </AuthProvider>
  );
}
