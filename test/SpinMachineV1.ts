import { ethers, upgrades, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory, Contract, BigNumber, utils } from "ethers";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { deployContract, MockProvider, solidity } from "ethereum-waffle"
import { smoddit, smockit } from "@eth-optimism/smock";

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
      let result = await spinMachine.buyExtraSpin(owner.address, 1);
      expect(result['to']).to.equal(spinMachine.address);
      expect(result['from']).to.equal(owner.address);
    });

    it("Should fail if owner or addr1 can't spin", async function() {
      let addr1CanSpin: boolean = await spinMachine.canSpinFor(addr1.address);
      let ownerCanSpin: boolean = await spinMachine.canSpin();
      expect(addr1CanSpin).to.equal(true)
      expect(ownerCanSpin).to.equal(true)
    });

    it("Should sucessfully spin", async function() {
      let success: boolean;
      let winnings: number;

      let mockERC20: Contract;
      mockERC20 = await deployMockContract(addr2, abi);
      spinMachine = await upgrades.deployProxy(SpinMachineV1, [mockERC20.address]);
      await mockERC20.mock.balanceOf.returns(utils.parseEther('9999'));
      await spinMachine.spin();
    });
  });
});
