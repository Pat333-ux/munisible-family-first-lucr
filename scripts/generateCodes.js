JavaScript
const crypto = require("crypto");
const fs = require("fs");

/**
 * Generates formatted gaming codes for mission completion.
 * @param {string} prefix - Category prefix (e.g., "MASTERY", "FAMILY", "TASKFORCE")
 * @param {number} count - Number of codes to generate
 * @returns {Array<string>} List of unique generated codes
 */
function generateGamingCodes(prefix, count = 10) {
  const codes = new Set();

  while (codes.size < count) {
    // Generate a 10-character random alphanumeric string
    const randomHex = crypto.randomBytes(5).toString("hex").toUpperCase();
    const code = `${prefix}-${randomHex.slice(0, 4)}-${randomHex.slice(4)}`;
    codes.add(code);
  }

  return Array.from(codes);
}

function exportToCSV(codes, filename = "generated_codes.csv") {
  const header = "Code,Category,Status\n";
  const rows = codes.map((c) => `${c.code},${c.category},Unclaimed`).join("\n");
  fs.writeFileSync(filename, header + rows);
  console.log(` Saved ${codes.length} codes to ${filename}`);
}

// Example usage: Batch generation for multiple categories
const batch = [
  ...generateGamingCodes("MASTERY", 5).map(c => ({ code: c, category: "Self-Mastery" })),
  ...generateGamingCodes("FAMILY", 5).map(c => ({ code: c, category: "Family Preservation" })),
  ...generateGamingCodes("TASKFORCE", 5).map(c => ({ code: c, category: "Task Force" }))
];

exportToCSV(batch);
To run the generator:

Bash
node scripts/generateCodes.js
2. Participant Redemption Interface (frontend/index.html)
A clean, responsive UI where participants enter their code and connect their Web3 wallet (MetaMask, Coinbase Wallet, etc.) to claim their LUCR tokens.

Save this in frontend/index.html:

HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Munisible & Family First - Unlock LUCR Tokens</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.umd.min.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0d1117;
      color: #c9d1d9;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 32px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    h1 { font-size: 1.4rem; color: #58a6ff; margin-bottom: 8px; }
    p { font-size: 0.9rem; color: #8b949e; margin-bottom: 24px; }
    input {
      width: 100%;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 6px;
      border: 1px solid #30363d;
      background-color: #0d1117;
      color: #fff;
      font-size: 1rem;
      box-sizing: border-box;
      text-transform: uppercase;
    }
    button {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: none;
      background-color: #238636;
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background-color: #2ea043; }
    #status { margin-top: 16px; font-size: 0.85rem; text-align: center; }
  </style>
</head>
<body>

  <div class="card">
    <h1>Unlock LUCR Tokens</h1>
    <p>Enter your gaming code earned from self-mastery, family preservation, or task force missions.</p>
    
    <button id="connectBtn" onclick="connectWallet()">Connect Wallet</button>
    <br><br>

    <input type="text" id="codeInput" placeholder="e.g. MASTERY-A1B2-C3D4" />
    <button onclick="redeemCode()">Redeem Code</button>

    <div id="status"></div>
  </div>

  <script>
    let provider, signer, contract;
    const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
    const contractABI = [
      "function redeemCode(string memory plainTextCode) external"
    ];

    async function connectWallet() {
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        document.getElementById("connectBtn").innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
        contract = new ethers.Contract(contractAddress, contractABI, signer);
      } else {
        alert("Please install MetaMask or another Web3 wallet.");
      }
    }

    async function redeemCode() {
      const code = document.getElementById("codeInput").value.trim();
      const status = document.getElementById("status");

      if (!contract) {
        status.innerText = "Please connect your wallet first.";
        status.style.color = "#f85149";
        return;
      }

      if (!code) {
        status.innerText = "Please enter a valid gaming code.";
        status.style.color = "#f85149";
        return;
      }

      try {
        status.innerText = "Submitting transaction...";
        status.style.color = "#e3b341";

        const tx = await contract.redeemCode(code);
        await tx.wait();

        status.innerText = "Success! LUCR Tokens unlocked!";
        status.style.color = "#3fb950";
      } catch (err) {
        console.error(err);
        status.innerText = err.reason || "Transaction failed or code already claimed.";
        status.style.color = "#f85149";
      }
    }
  </script>
</body>
</html>
4. GitHub Actions CI/CD (.github/workflows/test.yml)
Add automated contract testing every time you push code or open a pull request.

Save in .github/workflows/test.yml:

YAML
name: Smart Contract CI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx hardhat test
