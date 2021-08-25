import { ethers, upgrades } from "hardhat";

async function main() {
  const token = ""; // <= TODO Provide token address
  const SpinMachineUpgradeable = await ethers.getContractFactory("SpinMachineUpgradeable");
  const spinMachine = await upgrades.deployProxy(SpinMachineUpgradeable, [token]);
  await spinMachine.deployed();
  console.log("SpinMachineUpgradeable deployed to:", spinMachine.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
