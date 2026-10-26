Markdown# Operations & Deployment Manual

This manual provides instructions for deploying, testing, and managing the **Munisible Task Force & Family First LUCR Token Platform**.

---

## 1. Local Environment Setup

### Install Dependencies
```bash
npm install
Compile Smart ContractsCompile all Solidity contracts and generate ABI artifacts:Bashnpm run compile
Run Local Hardhat NodeSpin up a local EVM blockchain instance:Bashnpx hardhat node
2. Smart Contract DeploymentA. Deploying LocallyIn a separate terminal, execute the local deployment script:Bashnpm run deploy:local
B. Deploying to Testnet (Sepolia)Ensure your .env file is configured with your PRIVATE_KEY and INFURA_API_KEY.Run the deployment script targeting Sepolia:Bashnpm run deploy:sepolia
Copy the contract address output from the console and update NEXT_PUBLIC_CONTRACT_ADDRESS in .env and frontend/index.html.3. Gaming Code Lifecycle ManagementStep 1: Batch Code GenerationGenerate mission codes for task force leaders using the generator script:Bashnpm run generate-codes
This generates generated_codes.csv containing category-prefixed codes (e.g., MASTERY-XXXX-XXXX).Step 2: On-Chain Code RegistrationRegister the generated gaming codes into the live smart contract state:Bashnode scripts/registerCodesOnChain.js
Step 3: Redemption & VerificationParticipants navigate to the web dashboard (frontend/index.html).Connect Web3 Wallet (MetaMask / Coinbase Wallet).Input the assigned gaming code to unlock and mint LUCR tokens directly to their wallet.4. Contract Verification & Security ChecksRun Solhint LinterBashnpx solhint 'contracts/**/*.sol'
Verify Contract on EtherscanBashnpx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS> <OWNER_ADDRESS>
5. Summary of Key Repository CommandsActionCommandCompile Contractsnpm run compileRun Unit Testsnpm run testLint Solidity Filesnpx solhint 'contracts/**/*.sol'Generate Gaming Codesnpm run generate-codesRegister Codes On-Chainnode scripts/registerCodesOnChain.jsLaunch Dashboardnpm run serve
---

### Complete Repository File Tree

```text
munisible-family-first-lucr/
├── .github/
│   └── workflows/
│       └── test.yml                 # Automated CI test workflow
├── contracts/
│   ├── FamilyLucrRewards.sol        # Token & code unlock contract
│   └── FamilyGovernance.sol         # Governance & proposal contract
├── frontend/
│   └── index.html                   # Interactive web app dashboard
├── scripts/
│   ├── deploy.js                    # Hardhat deployment script
│   ├── generateCodes.js             # Offline batch gaming code generator
│   └── registerCodesOnChain.js      # On-chain code registration script
├── test/
│   └── FamilyLucrRewards.test.js    # Unit test suite
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── CONTRIBUTING.md                  # Contributor workflow guidelines
├── hardhat.config.js                # Hardhat network & EVM settings
├── LICENSE                          # MIT open-source license
├── LIQUIDITY.md                     # Tokenomics & DEX pool strategy
├── OPERATIONS.md                    # Operations & deployment manual
├── package.json                     # Project manifest & scripts
├── README.md                        # Project overview & quickstart
└── solhint.json                     # Code quality linter rules
