const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file");
  }

  const FamilyLucrRewards = await hre.ethers.getContractFactory("FamilyLucrRewards");
  const contract = FamilyLucrRewards.attach(contractAddress);

  // Example batch of codes to register on-chain
  const codesToRegister = [
    { code: "MASTERY-A1B2-C3D4", amount: "100", category: "Self-Mastery" },
    { code: "FAMILY-E5F6-G7H8", amount: "250", category: "Family Preservation" },
    { code: "TASKFORCE-I9J0-K1L2", amount: "500", category: "Task Force" }
  ];

  console.log(`Registering ${codesToRegister.length} codes to contract at ${contractAddress}...`);

  for (const item of codesToRegister) {
    const rewardWei = hre.ethers.parseEther(item.amount);
    const tx = await contract.registerRewardCode(item.code, rewardWei, item.category);
    await tx.wait();
    console.log(`[Registered] Code: ${item.code} | Category: ${item.category} | Reward: ${item.amount} LUCR`);
  }

  console.log("All codes successfully registered on-chain!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
