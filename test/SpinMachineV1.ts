import { ethers, upgrades, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { deployContract, MockProvider, solidity } from "ethereum-waffle"
import { smoddit, smockit } from "@eth-optimism/smock";
import { IERC20Upgradeable__factory, IERC20Upgradeable, IERC20 } from "../typechain";

describe("smart-rewards tests", async function() {
  let SpinMachineV1: ContractFactory;
  let spinMachine: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let BRLCFactory: ContractFactory;
  let BRLC: Contract;
  let MockedBRLC: Contract;
  let rinkeby_BRLC_address = "0x6275c7A100A6d16035DEa9930E18890bE42185A7";
  
  beforeEach(async function() {
    BRLCFactory = await ethers.getContractFactory("SafeERC20Upgradeable");
    BRLC = await BRLCFactory.deploy();
    await BRLC.deployed();
    MockedBRLC = await smockit(BRLC);
    [owner, addr1, addr2] = await ethers.getSigners();
    
    SpinMachineV1 = await ethers.getContractFactory("SpinMachineV1");
    spinMachine = await upgrades.deployProxy(SpinMachineV1, [MockedBRLC.address]);
    await spinMachine.deployed();
  });

  describe("Gamification tests", function() {

    it("Should set the right owner", async function () {
      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await spinMachine.owner()).to.equal(owner.address);
    });

    it("Should set prizes correctly", async function() {
      let prizes = [1,2,3];
      let prizes_set: number[];
      await spinMachine.setPrizes(prizes);
      prizes_set = await spinMachine.getPrizes()
      expect(prizes_set[0]).to.equal(1);
      expect(prizes_set[1]).to.equal(2);
      expect(prizes_set[2]).to.equal(3);
    });

    it("Should set a new free spin delay", async function() {
      let previous_free_spin_delay: number;
      previous_free_spin_delay = await spinMachine.freeSpinDelay();
      spinMachine.setFreeSpinDelay(43200)
      expect(previous_free_spin_delay).to.equal(86400);
      expect(await spinMachine.freeSpinDelay()).to.equal(43200);
    });

    it("Should set a new extra spin price", async function() {
      let new_free_spin_price: number;
      new_free_spin_price = 100;
      await spinMachine.setExtraSpinPrice(new_free_spin_price);
      expect(await spinMachine.extraSpinPrice()).to.equal(100);
    });

    it("Should buy extra spin", async function() {
      console.log(spinMachine.address);
      console.log(BRLC.address);
      console.log(MockedBRLC.address);
      console.log(owner.address);
      console.log(await spinMachine.buyExtraSpin(owner.address, 1));
    });

    it("Should fail if owner or addr1 can't spin", async function() {
      let addr1CanSpin: boolean = await spinMachine.canSpinFor(addr1.address);
      let ownerCanSpin: boolean = await spinMachine.canSpin();
      expect(addr1CanSpin).to.equal(true)
      expect(ownerCanSpin).to.equal(true)
    });

    it("Should sucessfully spin", async function() {
      let ModifiableBRLCFactory: ContractFactory = await smoddit("SafeERC20Upgradeable")
      let ModifiableBRLC: Contract = await ModifiableBRLCFactory.deploy()
      let success: boolean;
      let winnings: number;

      //console.log(await MockedBRLC.smocked.balanceOf().will.return.with(20));
      //console.log(await MockedSpinMachine.smocked.spin)
      await spinMachine.buyExtraSpin(owner.address, 1);
      [ success, winnings ] = await spinMachine.spin();
      //expect(MockedSpinMachine.smocked.spin).to.equal({success: true, winnings: 10})
    });
  });
});