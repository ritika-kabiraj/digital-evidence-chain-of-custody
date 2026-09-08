const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying EvidenceLedger Smart Contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const EvidenceLedger = await hre.ethers.getContractFactory("EvidenceLedger");
  const ledger = await EvidenceLedger.deploy();
  await ledger.waitForDeployment();

  const contractAddress = await ledger.getAddress();
  console.log(`\n✅ EvidenceLedger deployed successfully!`);
  console.log(`Contract Address: ${contractAddress}`);

  // Prepare deployment info payload
  const contractArtifact = await hre.artifacts.readArtifact("EvidenceLedger");
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    abi: contractArtifact.abi,
    deployedAt: new Date().toISOString(),
  };

  // Export deployment info for backend & frontend
  const exportsDir = path.join(__dirname, "../shared");
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const exportPath = path.join(exportsDir, "EvidenceLedger.json");
  fs.writeFileSync(exportPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Exported deployment info & ABI to: ${exportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
