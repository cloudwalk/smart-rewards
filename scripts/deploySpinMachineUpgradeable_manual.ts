import { ethers } from "hardhat";

async function main() {
    const token = ""; // <= TODO Provide token address

    // 1. Deploy implementation contract
    const SpinMachineUpgradeable =
      await ethers.getContractFactory("SpinMachineUpgradeable");
    const spinMachineUpgradeable = await SpinMachineUpgradeable.deploy();
    await spinMachineUpgradeable.deployed();
    console.log(
      "SpinMachineUpgradeable deployed to:",
      spinMachineUpgradeable.address
    );

    // 2. Deploy proxy admin contract
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.deployed();
    console.log("ProxyAdmin deployed to:", proxyAdmin.address);

    // 3. Deploy proxy contract
    const fragment =
    SpinMachineUpgradeable.interface.getFunction("initialize");
    const data = SpinMachineUpgradeable.interface.encodeFunctionData(
      fragment,
      [token]
    );
  console.log(data);
    const TransparentUpgradeableProxy =
      await ethers.getContractFactory("TransparentUpgradeableProxy");
    const transparentUpgradeableProxy = await TransparentUpgradeableProxy.deploy(
        spinMachineUpgradeable.address,
        proxyAdmin.address,
        data
    );
    await transparentUpgradeableProxy.deployed();
    console.log(
      "TransparentUpgradeableProxy deployed to:",
      transparentUpgradeableProxy.address
    );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
