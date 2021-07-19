const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const SpinMachineV1 = await hre.ethers.getContractFactory("SpinMachineV1");
  const spinMachineV1 = await SpinMachineV1.deploy(
    {
      gasPrice: 15000000,
      gasLimit: 250000000
    });

  // Deploy
  await spinMachineV1.deployed();

  // Write contract address
  console.log("SpinMachineV1 deployed to:", spinMachineV1.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });