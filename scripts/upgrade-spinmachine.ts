import { ethers, upgrades } from "hardhat";

async function main() {
  const SPINMACHINE_ADDRESS = "0x5B87542d843607180f96C080431dAd5bbecC9c61";
  const SpinMachine = await ethers.getContractFactory("SpinMachineV1");
  const spinMachine = await upgrades.upgradeProxy(SPINMACHINE_ADDRESS, SpinMachine);
  console.log("SpinMachine upgraded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
