import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory, Contract } from "ethers";

describe("gamification tests", async function() {
  let SpinMachineV1: ContractFactory;
  let spinMachine: Contract;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let BRLCFactory: ContractFactory;
  let BRLC: Contract;
  let SpinMachineInterface
  
  beforeEach(async function() {
    BRLCFactory = await ethers.getContractFactory("ERC20Mock");
    BRLC = await BRLCFactory.deploy("BRL Coin", "BRLC", 6);
    await BRLC.deployed();
    [owner, alice, bob] = await ethers.getSigners();
    
    SpinMachineV1 = await ethers.getContractFactory("SpinMachineV1");
    spinMachine = await upgrades.deployProxy(SpinMachineV1, [BRLC.address]);
    await spinMachine.deployed();
    SpinMachineInterface = spinMachine.interface
  });

  describe("SpinMachineV1 tests", async function() {

    it("Should set the right owner and token", async function() {
      expect(await spinMachine.owner()).to.equal(owner.address);
      expect(await spinMachine.token()).to.equal(BRLC.address);
    });

    it("Should set prizes correctly", async function() {
      const prizes: number[] = [1,2,3];
      const distribution_event = await spinMachine.setPrizes(prizes);
      const new_prizes = await spinMachine.getPrizes()
      expect(new_prizes[0]).to.equal(1);
      expect(new_prizes[1]).to.equal(2);
      expect(new_prizes[2]).to.equal(3);
      expect(distribution_event).to.emit(spinMachine, "PrizesDistributionChanged").withArgs(new_prizes);
    });

    it("Should set spin delays correctly", async function() {
      const old_spin_delay = await spinMachine.freeSpinDelay();
      const new_spin_delay: number = 2;
      const spin_delay_event = await spinMachine.setFreeSpinDelay(new_spin_delay);
      expect(await spinMachine.freeSpinDelay()).to.equal(2);
      expect(spin_delay_event).to.emit(spinMachine, "FreeSpinDelayChanged").withArgs(new_spin_delay, old_spin_delay);
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
      const old_price = await spinMachine.extraSpinPrice();
      const new_price: number = 100;
      const result = await spinMachine.setExtraSpinPrice(new_price);
      expect(await spinMachine.extraSpinPrice()).to.equal(100);
      expect(result).to.emit(spinMachine, "ExtraSpinPriceChanged").withArgs("100", old_price);
    });

    it("Should buy extra spin", async function() {
      let alice_extra_spins = await spinMachine.extraSpins(alice.address);
      expect(alice_extra_spins.toString()).to.equal("0");
      
      await BRLC.approve(spinMachine.address, ethers.utils.parseEther("1"))
      await BRLC.mint(ethers.utils.parseEther("1"));
      
      await spinMachine.setExtraSpinPrice(ethers.utils.parseEther("0.000000000000000001"));
      
      let owner_balance = await owner.getBalance()
      const result = await spinMachine.buyExtraSpin(alice.address, 1);
      alice_extra_spins = await spinMachine.extraSpins(alice.address);

      expect(result).to.emit(spinMachine, "ExtraSpinPurchased").withArgs(owner.address, alice.address, 1);
      expect(alice_extra_spins.toString()).to.equal("1");
      // check if correct token amount was transfered from owner to spinMachine
      expect(ethers.utils.formatEther(await BRLC.balanceOf(owner.address))).to.equal("0.999999999999999999");
    });

    it("Should grant extra spin", async function() {
      const result = await spinMachine.grantExtraSpin(bob.address, 1);
      expect(result).to.emit(spinMachine, "ExtraSpinGranted").withArgs(owner.address, bob.address, "1");
    });

    it("Should fail if owner or alice can't spin", async function() {
      let alice_can_spin: boolean = await spinMachine.canSpinFor(alice.address);
      let owner_can_spin: boolean = await spinMachine.canSpin();
      expect(alice_can_spin).to.equal(true)
      expect(owner_can_spin).to.equal(true)
    });

    it("Should sucessfully spin n times if delay is zero", async function() {
      await spinMachine.setFreeSpinDelay(0);
      const number_of_spins: number = 5;
      for(let i = 0; i < number_of_spins; i++) {
        let res = await spinMachine.connect(bob).spin();
        res = await res.wait()
        let args = SpinMachineInterface.parseLog(res.logs[0]).args

        let winnings = args.winnings.toString();
        let sent = args.sent.toString();
        let extra = args.extra;
        expect(extra).to.equal(false);
        expect(await spinMachine.connect(bob).spin()).to.emit(spinMachine, "Spin").withArgs(bob.address, winnings, sent, extra);
      }
    });
    
    it("Should spin twice if there is delay but has one extra spin", async function() {
      expect((await spinMachine.freeSpinDelay()).toNumber()).to.be.greaterThan(0);

      let res = await spinMachine.connect(bob).spin();
      res = await res.wait();
      let args = SpinMachineInterface.parseLog(res.logs[0]).args

      let winnings = args.winnings.toString();
      let sent = args.sent.toString();
      let extra = args.extra;
      expect(extra).to.equal(false);
      
      // extra spin
      await spinMachine.grantExtraSpin(bob.address, 1);
      res = await spinMachine.connect(bob).spin();
      res = await res.wait();
      args = SpinMachineInterface.parseLog(res.logs[0]).args;
      winnings = args.winnings.toString();
      sent = args.sent.toString();
      extra = args.extra;
      expect(extra).to.equal(true);
    });

    it("Should not spin more than once if there is delay and no extras", async function() {
      expect((await spinMachine.freeSpinDelay()).toNumber()).to.be.greaterThan(0);
      expect(await spinMachine.extraSpins(bob.address)).to.equal(0);
      let res = await spinMachine.connect(bob).spin();
      res = await res.wait()
      let args = SpinMachineInterface.parseLog(res.logs[0]).args
      let winnings = args.winnings.toString();
      let sent = args.sent.toString();
      let extra = args.extra;
      expect(extra).to.equal(false);
      
      // try to spin again
      expect(await spinMachine.canSpinFor(bob.address)).to.equal(false);
      // find a way to check if spin() really happened, can't access 'success'
      // Waffle's method to check if function was called doesn't work
      // only current way is checking that logs are empty
      res = await spinMachine.connect(bob).spin();
      res = await res.wait();
      const empty_array = [];
      expect(res.logs).to.deep.equal(empty_array);
    });
  });
});
