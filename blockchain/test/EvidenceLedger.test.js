const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvidenceLedger Smart Contract", function () {
  let EvidenceLedger, evidenceLedger;
  let owner, officer1, officer2, auditor;

  const sampleEvidenceId = ethers.id("EVD-2026-0001");
  const sampleCaseNumber = "CASE-2026-99";
  const validSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // sha256 for empty string
  const invalidSha256 = "short_hash";
  const sampleStorageRef = "/storage/vault/cases/CASE-2026-99/evd-1.bin";

  beforeEach(async function () {
    [owner, officer1, officer2, auditor] = await ethers.getSigners();
    EvidenceLedger = await ethers.getContractFactory("EvidenceLedger");
    evidenceLedger = await EvidenceLedger.deploy();
    await evidenceLedger.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await evidenceLedger.admin()).to.equal(owner.address);
    });

    it("Should start with zero evidence count", async function () {
      expect(await evidenceLedger.getEvidenceCount()).to.equal(0);
    });
  });

  describe("Evidence Registration", function () {
    it("Should register evidence successfully and emit EvidenceRegistered event", async function () {
      await expect(
        evidenceLedger.connect(officer1).registerEvidence(
          sampleEvidenceId,
          sampleCaseNumber,
          validSha256,
          sampleStorageRef,
          officer1.address
        )
      )
        .to.emit(evidenceLedger, "EvidenceRegistered")
        .withArgs(
          sampleEvidenceId,
          sampleCaseNumber,
          validSha256,
          sampleStorageRef,
          officer1.address,
          officer1.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      expect(await evidenceLedger.getEvidenceCount()).to.equal(1);

      const record = await evidenceLedger.getEvidence(sampleEvidenceId);
      expect(record.caseNumber).to.equal(sampleCaseNumber);
      expect(record.sha256Hash).to.equal(validSha256);
      expect(record.currentCustodian).to.equal(officer1.address);
      expect(record.submitter).to.equal(officer1.address);
      expect(record.exists).to.be.true;
    });

    it("Should reject duplicate evidence ID", async function () {
      await evidenceLedger.connect(officer1).registerEvidence(
        sampleEvidenceId,
        sampleCaseNumber,
        validSha256,
        sampleStorageRef,
        officer1.address
      );

      await expect(
        evidenceLedger.connect(officer1).registerEvidence(
          sampleEvidenceId,
          sampleCaseNumber,
          validSha256,
          sampleStorageRef,
          officer1.address
        )
      ).to.be.revertedWith("EvidenceLedger: Evidence already registered");
    });

    it("Should reject invalid SHA256 length", async function () {
      await expect(
        evidenceLedger.connect(officer1).registerEvidence(
          sampleEvidenceId,
          sampleCaseNumber,
          invalidSha256,
          sampleStorageRef,
          officer1.address
        )
      ).to.be.revertedWith("EvidenceLedger: SHA256 must be 64 hex characters");
    });
  });

  describe("Chain of Custody Transfers", function () {
    beforeEach(async function () {
      await evidenceLedger.connect(officer1).registerEvidence(
        sampleEvidenceId,
        sampleCaseNumber,
        validSha256,
        sampleStorageRef,
        officer1.address
      );
    });

    it("Should allow current custodian to transfer evidence", async function () {
      await expect(
        evidenceLedger.connect(officer1).transferCustody(
          sampleEvidenceId,
          officer2.address,
          "Transferred for forensic disk analysis",
          "Forensic Lab 3"
        )
      )
        .to.emit(evidenceLedger, "CustodyTransferred")
        .withArgs(
          sampleEvidenceId,
          officer1.address,
          officer2.address,
          "Transferred for forensic disk analysis",
          "Forensic Lab 3",
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const record = await evidenceLedger.getEvidence(sampleEvidenceId);
      expect(record.currentCustodian).to.equal(officer2.address);
      expect(record.status).to.equal(2); // Transferred enum index

      const history = await evidenceLedger.getCustodyHistory(sampleEvidenceId);
      expect(history.length).to.equal(2); // Initial + 1 Transfer
      expect(history[1].fromCustodian).to.equal(officer1.address);
      expect(history[1].toCustodian).to.equal(officer2.address);
      expect(history[1].reason).to.equal("Transferred for forensic disk analysis");
    });

    it("Should reject transfer from non-custodian", async function () {
      await expect(
        evidenceLedger.connect(auditor).transferCustody(
          sampleEvidenceId,
          officer2.address,
          "Unauthorized attempt",
          "Unknown"
        )
      ).to.be.revertedWith("EvidenceLedger: Only current custodian or admin can transfer");
    });
  });

  describe("Integrity Verification", function () {
    beforeEach(async function () {
      await evidenceLedger.connect(officer1).registerEvidence(
        sampleEvidenceId,
        sampleCaseNumber,
        validSha256,
        sampleStorageRef,
        officer1.address
      );
    });

    it("Should verify exact SHA-256 match and emit event", async function () {
      const tx = await evidenceLedger.connect(auditor).verifyEvidenceHash(sampleEvidenceId, validSha256);
      await expect(tx)
        .to.emit(evidenceLedger, "EvidenceVerified")
        .withArgs(
          sampleEvidenceId,
          true,
          auditor.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );
    });

    it("Should detect SHA-256 mismatch", async function () {
      const tamperedHash = "a3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999";
      const tx = await evidenceLedger.connect(auditor).verifyEvidenceHash(sampleEvidenceId, tamperedHash);
      await expect(tx)
        .to.emit(evidenceLedger, "EvidenceVerified")
        .withArgs(
          sampleEvidenceId,
          false,
          auditor.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );
    });
  });
});
