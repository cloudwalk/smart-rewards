import { ethers } from "hardhat";

async function main() {
  const Faucet = await ethers.getContractFactory("FaucetV1");
  const faucet = await Faucet.deploy();
  await faucet.deployed();
  console.log("FaucetV1 deployed to:", faucet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
