import { ethers, upgrades, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory, Contract, utils } from "ethers";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { smockit } from "@eth-optimism/smock";

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
  let abi = [
    "function balanceOf(address account) public view returns (uint256)",
    "function safeTransferFrom(IERC20Upgradeable token, address from, address to, uint256 value)"
  ]
  
  beforeEach(async function() {
    BRLCFactory = await ethers.getContractFactory("SafeERC20Upgradeable");
    BRLC = await BRLCFactory.deploy();
    await BRLC.deployed();
    MockedBRLC = await smockit(BRLCFactory);
    [owner, addr1, addr2] = await ethers.getSigners();
    
    SpinMachineV1 = await ethers.getContractFactory("SpinMachineV1");
    spinMachine = await upgrades.deployProxy(SpinMachineV1, [MockedBRLC.address]);
    await spinMachine.deployed();
  });

  describe("Gamification tests", function() {

    it("Should set the right owner and token", async function () {
      expect(await spinMachine.owner()).to.equal(owner.address);
      expect(await spinMachine.token()).to.equal(MockedBRLC.address);
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
      let result = await spinMachine.buyExtraSpin(addr1.address, 1);
      expect(result).to.emit(spinMachine, "ExtraSpinPurchased").withArgs(owner.address, addr1.address, "1");
    });

    it("Should fail if owner or addr1 can't spin", async function() {
      let addr1CanSpin: boolean = await spinMachine.canSpinFor(addr1.address);
      let ownerCanSpin: boolean = await spinMachine.canSpin();
      expect(addr1CanSpin).to.equal(true)
      expect(ownerCanSpin).to.equal(true)
    });

    it("Should sucessfully spin", async function() {
      let mockERC20: Contract;
      mockERC20 = await deployMockContract(addr2, abi);
      spinMachine = await upgrades.deployProxy(SpinMachineV1, [mockERC20.address]);
      await mockERC20.mock.balanceOf.returns(utils.parseEther('9999'));
      expect(await spinMachine.spin()).to.emit(spinMachine, "Spin").withArgs(owner.address, "0", "0", false);
    });
  });
});
