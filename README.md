# 🔐 Digital Evidence Integrity & Chain-of-Custody Management System

A blockchain-based digital evidence management system designed to preserve the **integrity, authenticity, and traceability of digital evidence** throughout its lifecycle.

The system combines **blockchain technology, cryptographic hashing, role-based access control, audit logging, and secure evidence storage** to provide a tamper-evident chain-of-custody mechanism for digital evidence.

---

## 📌 Overview

Digital evidence such as documents, images, videos, logs, and other electronic files can be modified, replaced, or mishandled during an investigation.

Traditional evidence-management systems generally rely on centralized databases, making it difficult to independently verify whether an evidence file has remained unchanged.

This project addresses this problem by storing a **cryptographic fingerprint of evidence on a blockchain**, while keeping the actual evidence file in off-chain storage.

Whenever evidence is uploaded, transferred, accessed, or verified, the system maintains corresponding records that help establish a transparent and traceable chain of custody.

---

## 🎯 Objectives

* Preserve the integrity of digital evidence using cryptographic hashing.
* Maintain a tamper-evident record of evidence on a blockchain.
* Track the complete chain of custody of evidence.
* Prevent unauthorized access through authentication and role-based authorization.
* Maintain auditable records of important system activities.
* Provide mechanisms for independently verifying evidence integrity.
* Separate sensitive evidence files from blockchain metadata.

---

## ✨ Key Features

### 🔒 Evidence Integrity

* SHA-256 hashing of uploaded evidence.
* Unique evidence identification.
* Blockchain-backed evidence integrity records.
* Hash-based verification to detect modification.

### ⛓️ Blockchain-Based Ledger

* Solidity smart contract for evidence records.
* Immutable blockchain records.
* Evidence metadata anchoring.
* Custody-event tracking.
* Blockchain verification of evidence hashes.

### 👥 Role-Based Access Control

The system supports authenticated users with controlled access to system functionality.

Access permissions are enforced according to user roles, helping prevent unauthorized operations.

### 📋 Chain of Custody

The system records evidence custody events throughout its lifecycle.

Custody records can include:

* Evidence identification
* Previous custodian
* New custodian
* Transfer information
* Timestamps
* Relevant custody events

### 📝 Audit Logging

Important system activities are recorded through an audit mechanism to support accountability and investigation.

### 📁 Secure Evidence Storage

Actual evidence files are maintained separately from blockchain records.

The blockchain stores the cryptographic representation and relevant metadata rather than placing the complete evidence file directly on-chain.

### 🔍 Evidence Verification

The system provides a verification workflow that compares the current evidence hash against the integrity information recorded by the system.

This allows potential tampering or modification to be detected.

### 📂 Case Management

Evidence can be associated with investigation cases, allowing evidence and custody information to be organized within a case-oriented workflow.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      User / Admin    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │   Vite + Tailwind    │
                         └──────────┬───────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   FastAPI Backend    │
                         ├──────────────────────┤
                         │ Authentication       │
                         │ RBAC                 │
                         │ Evidence Management  │
                         │ Case Management      │
                         │ Custody Management   │
                         │ Audit Services       │
                         │ Verification         │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐               ┌──────────────────┐
          │ Evidence Storage │               │ Blockchain Layer │
          │   Off-Chain      │               │ Solidity         │
          └──────────────────┘               │ EvidenceLedger   │
                                             └──────────────────┘
                                                      │
                                                      ▼
                                             ┌──────────────────┐
                                             │ Integrity /      │
                                             │ Custody Records  │
                                             └──────────────────┘
```

---

## 🔄 Evidence Lifecycle

```text
 Evidence Upload
       │
       ▼
 Generate SHA-256 Hash
       │
       ├──────────────► Store Evidence Off-Chain
       │
       ▼
 Register Evidence
       │
       ▼
 Store Integrity Metadata
       │
       ▼
 Blockchain Ledger
       │
       ▼
 Custody Transfers
       │
       ▼
 Audit Events
       │
       ▼
 Evidence Verification
       │
       ▼
 Hash Comparison
       │
       ├── Match ──────► Evidence Integrity Verified
       │
       └── Mismatch ───► Possible Tampering Detected
```

---

## 🛡️ Security Model

The project uses multiple layers of security rather than relying on blockchain alone.

### Cryptographic Integrity

Each evidence file is processed using **SHA-256** to generate a deterministic cryptographic digest.

If the contents of the evidence change, its hash changes as well.

### Blockchain Immutability

The evidence hash and relevant metadata can be anchored to the blockchain through the `EvidenceLedger` smart contract.

This provides a tamper-evident integrity reference.

### Authentication

The backend provides authenticated access to protected system functionality.

### Authorization

Role-Based Access Control restricts operations according to the permissions assigned to users.

### Auditability

System operations are recorded through audit logging to provide an additional layer of accountability.

### Separation of Storage

Large evidence files are maintained off-chain while integrity-related information is represented through hashes and blockchain metadata.

---

## ⛓️ Smart Contract

The core blockchain component is:

```text
blockchain/contracts/EvidenceLedger.sol
```

The smart contract is responsible for maintaining blockchain-backed evidence information and custody-related records.

The repository also contains:

```text
blockchain/
├── contracts/
│   └── EvidenceLedger.sol
├── scripts/
│   └── deploy.js
├── shared/
│   └── EvidenceLedger.json
└── test/
    └── EvidenceLedger.test.js
```

The project uses **Hardhat** for smart-contract development, testing, and deployment.

---

## 🧩 Backend Architecture

The backend is implemented using **FastAPI**.

```text
backend/
└── app/
    ├── api/
    │   ├── router.py
    │   └── v1/
    │       ├── audit.py
    │       ├── auth.py
    │       ├── cases.py
    │       ├── custody.py
    │       ├── evidence.py
    │       ├── users.py
    │       └── verification.py
    │
    ├── core/
    │   ├── config.py
    │   ├── hashing.py
    │   ├── rbac.py
    │   └── security.py
    │
    ├── db/
    │   ├── models.py
    │   └── session.py
    │
    ├── schemas/
    │   ├── case.py
    │   ├── custody.py
    │   ├── evidence.py
    │   └── user.py
    │
    └── services/
        ├── audit_service.py
        ├── blockchain_service.py
        └── storage_service.py
```

This modular structure separates:

* API routes
* security
* authentication
* database models
* request/response schemas
* blockchain interaction
* evidence storage
* audit functionality

---

## 💻 Frontend

The frontend is built using:

* React
* Vite
* Tailwind CSS

Major application areas include:

* Authentication
* Dashboard
* Case management
* Evidence management
* Evidence details
* Custody timeline
* Audit logs
* Evidence verification

---

## 🧪 Testing

The repository includes testing for both the backend and blockchain components.

### Backend

```text
backend/tests/test_api.py
```

### Smart Contract

```text
blockchain/test/EvidenceLedger.test.js
```

Smart-contract testing is performed using the Hardhat testing environment.

---

## 🛠️ Technology Stack

| Layer       | Technologies                  |
| ----------- | ----------------------------- |
| Frontend    | React, Vite, Tailwind CSS     |
| Backend     | Python, FastAPI               |
| Database    | SQLite / SQLAlchemy           |
| Blockchain  | Solidity, Hardhat             |
| Web3        | Blockchain/Web3 integration   |
| Security    | SHA-256, Authentication, RBAC |
| Testing     | Pytest, Hardhat Tests         |
| Development | Git, GitHub                   |

---

## 📁 Repository Structure

```text
digital-evidence-chain-of-custody/
│
├── backend/
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   └── storage/
│
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   ├── shared/
│   ├── test/
│   ├── hardhat.config.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── start-dev.ps1
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Python 3.x
* Node.js
* npm
* Git
* Hardhat environment

### Clone the Repository

```bash
git clone https://github.com/<your-username>/digital-evidence-chain-of-custody.git

cd digital-evidence-chain-of-custody
```

### Backend Setup

```bash
cd backend

python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

### Blockchain Setup

Open another terminal:

```powershell
cd blockchain
npm install
```

Compile the smart contract:

```powershell
npx hardhat compile
```

Run the smart-contract tests:

```powershell
npx hardhat test
```

### Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will then be available through the Vite development server.

> Configuration details may need to be adjusted depending on the local blockchain and backend environment.

---

## 🔍 Evidence Verification Workflow

The verification process follows the general workflow:

```text
Current Evidence File
        │
        ▼
   SHA-256 Hash
        │
        ▼
Compare With Recorded Hash
        │
        ▼
 ┌──────┴──────┐
 │             │
Match       Mismatch
 │             │
 ▼             ▼
Valid       Possible
Evidence    Tampering
```

This approach allows the system to identify whether the contents of an evidence file differ from the previously recorded integrity value.

---

## 📸 Screenshots

### Dashboard

<img width="959" height="415" alt="image" src="https://github.com/user-attachments/assets/a700c412-0899-4874-9034-662b6b3767ea" />

### Evidence Management

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e269ad25-2f70-4a7d-b407-6c7b1660a9c0" />


### Chain of Custody

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c4c57dee-6151-4452-bc7a-b64059f67d6a" />


### Evidence Verification

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c0477c22-7315-4aa7-849e-cf98061db447" />


### Audit Logs

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f0f864bf-e49d-4e7b-93ac-89897c85736b" />


---

## 🔮 Future Enhancements

Potential improvements include:

* Deployment to a public/private blockchain network.
* Distributed or decentralized evidence storage.
* Advanced forensic metadata extraction.
* Digital signatures for evidence handlers.
* Multi-factor authentication.
* Hardware-backed key management.
* Advanced anomaly detection for suspicious custody activity.
* Automated forensic evidence classification.
* Immutable timestamping through external blockchain networks.
* Comprehensive security monitoring and alerting.

---

## ⚠️ Security & Privacy Notice

This repository is intended for **educational, research, and demonstration purposes**.

Real-world digital evidence can contain highly sensitive or confidential information. Actual evidence files, credentials, private keys, database files, and other sensitive information should **never be committed to a public repository**.

The repository's `.gitignore` excludes local evidence storage, databases, virtual environments, dependencies, build artifacts, and environment-specific files.

---

## 📚 Project Focus

This project demonstrates the application of:

**Cybersecurity + Blockchain + Cryptography + Web Development + Digital Forensics**

to the problem of maintaining trustworthy digital evidence throughout its chain of custody.

---

## 👨‍💻 Author

**Ritika Kabiraj**

Computer Science & Engineering

---

## ⭐ If you find this project useful

Feel free to explore the repository, review the implementation, and use the project as a reference for research and educational purposes.
