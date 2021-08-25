import { ethers } from "hardhat";

async function main() {
  const token = ""; // <= TODO Provide token address
  const SpinMachine = await ethers.getContractFactory("SpinMachine");
  const spinMachine = await SpinMachine.deploy(token);
  await spinMachine.deployed();
  console.log("SpinMachine deployed to:", spinMachine.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
