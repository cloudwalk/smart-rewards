const hre = require("hardhat");

async function main() {

  const block = await ethers.provider.getBlock();
  console.log(block.number);
  console.log(block.timestamp);
  return;


  // L1 contracts
  const erc20Address = "0xE0EcD14EB2d5294248B695d97868892Dc1F87F8E";
  const spinMachineAddress = "0xEa8Ec6D72fdb2FB4903401467924696C5c5798C2";

  // We get owner account
  const [owner] = await ethers.getSigners();

  // We get L1 ERC20 contract
  const ERC20 = await hre.ethers.getContractFactory("ERC200");
  const erc20 = await ERC20.attach(erc20Address);


  //  We get L1 ERC20Gateway contract
  const SpinMachineV1 = await hre.ethers.getContractFactory("SpinMachineV1");
  const spinMachine = await SpinMachineV1.attach(spinMachineAddress);

  // console.log('SM extraSpinPrice:', (await spinMachine.extraSpinPrice()).toNumber());
  // console.log('SM freeSpinDelay:', (await spinMachine.freeSpinDelay()).toNumber());
  //console.log('SM prizes:', await spinMachine.getPrizes());
  // console.log('SM token:', await spinMachine.token());

  // console.log('ERC20 totalSupply:', (await erc20.totalSupply()).toNumber());
  // console.log('ERC20 SM balanceOf:', (await erc20.balanceOf(spinMachineAddress)).toNumber());

  //await spinMachine.initialize();
  //await erc20.transfer(spinMachineAddress, 1500000);
  //await spinMachine.setExtraSpinPrice(100000);
  //await spinMachine.setFreeSpinDelay(5);
  //await spinMachine.setPrizes([500000,500000,500000,500000,500000,500000,500000,500000,500000,500000,400000,400000,400000,400000,400000,400000,400000,400000,400000,400000,300000,300000,300000,300000,300000,300000,300000,300000,300000,300000,200000,200000,200000,200000,200000,200000,200000,200000,200000,200000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000]);
  //await spinMachine.setPrizes([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);

  const before = (await erc20.balanceOf(owner.address)).toNumber();
  const tx = await spinMachine.spin();
  const after = (await erc20.balanceOf(owner.address)).toNumber();
  console.log(before + ' -> ' + after);
  console.log(tx.hash);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
