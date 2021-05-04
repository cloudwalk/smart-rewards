import { ethers, upgrades, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory, Contract } from "ethers";

describe("smart-rewards tests", async function() {
  let SpinMachineV1: ContractFactory;
  let spinMachine: Contract;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let BRLCFactory: ContractFactory;
  let BRLC: Contract;
  
  beforeEach(async function() {
    BRLCFactory = await ethers.getContractFactory("ERC20Mock");
    BRLC = await BRLCFactory.deploy("BRL Coin", "BRLC", 6);
    await BRLC.deployed();
    [owner, alice, bob] = await ethers.getSigners();
    
    SpinMachineV1 = await ethers.getContractFactory("SpinMachineV1");
    spinMachine = await upgrades.deployProxy(SpinMachineV1, [BRLC.address]);
    await spinMachine.deployed();
  });

  describe("Gamification tests", function() {

    it("Should set the right owner and token", async function () {
      expect(await spinMachine.owner()).to.equal(owner.address);
      expect(await spinMachine.token()).to.equal(BRLC.address);
    });

    it("Should set prizes correctly", async function() {
      let prizes = [1,2,3];
      let distribution_event = await spinMachine.setPrizes(prizes);
      let new_prizes = await spinMachine.getPrizes()
      expect(new_prizes[0]).to.equal(1);
      expect(new_prizes[1]).to.equal(2);
      expect(new_prizes[2]).to.equal(3);
      expect(distribution_event).to.emit(spinMachine, "PrizesDistributionChanged").withArgs(new_prizes);
    });

    it("Should set a new free spin delay", async function() {
      let previous_free_spin_delay: number;
      previous_free_spin_delay = await spinMachine.freeSpinDelay();
      let result = await spinMachine.setFreeSpinDelay(43200);
      expect(previous_free_spin_delay).to.equal(86400);
      expect(await spinMachine.freeSpinDelay()).to.equal(43200);
      expect(result).to.emit(spinMachine, "FreeSpinDelayChanged").withArgs("43200", "86400");
    });

    it("Should set a new extra spin price", async function() {
      let new_free_spin_price: number;
      new_free_spin_price = 100;
      await spinMachine.setExtraSpinPrice(new_free_spin_price);
      expect(await spinMachine.extraSpinPrice()).to.equal(100);
    });

    it("Should buy extra spin", async function() {
      let result = await spinMachine.buyExtraSpin(alice.address, 1);
      expect(result).to.emit(spinMachine, "ExtraSpinPurchased").withArgs(owner.address, alice.address, "1");
    });

    it("Should fail if owner or alice can't spin", async function() {
      let aliceCanSpin: boolean = await spinMachine.canSpinFor(alice.address);
      let ownerCanSpin: boolean = await spinMachine.canSpin();
      expect(aliceCanSpin).to.equal(true)
      expect(ownerCanSpin).to.equal(true)
    });

    it("Should sucessfully spin", async function() {
      expect(await spinMachine.spin()).to.emit(spinMachine, "Spin").withArgs(owner.address, "0", "0", false);
    });
  });
});
