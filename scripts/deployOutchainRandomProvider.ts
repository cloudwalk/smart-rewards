import { ethers } from "hardhat";

async function main() {
  const OutchainRandomProvider = await ethers.getContractFactory("OutchainRandomProvider");
  const randomProvider = await OutchainRandomProvider.deploy();
  await randomProvider.deployed();
  console.log("OutchainRandomProvider deployed to:", randomProvider.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
