import { ethers } from "hardhat";

async function main() {
  const OnchainRandomProvider = await ethers.getContractFactory("OnchainRandomProvider");
  const randomProvider = await OnchainRandomProvider.deploy();
  await randomProvider.deployed();
  console.log("OnchainRandomProvider deployed to:", randomProvider.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
