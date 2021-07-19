import { ethers, upgrades } from "hardhat";

async function main() {          
  const SpinMachine = await ethers.getContractFactory("SpinMachineV1");
  const spinMachine = await upgrades.deployProxy(SpinMachine, ["0x0000000000000000000000000000000000000000"]);
  await spinMachine.deployed();
  console.log("SpinMachineV1 deployed to:", spinMachine.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
