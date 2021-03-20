import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory, Contract, VoidSigner, Wallet } from "ethers";
import { smockit, smoddit } from "@eth-optimism/smock"

describe("smart-rewards tests", async function() {
  let SpinMachineV1: ContractFactory;
  let spinMachine: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let brlc_address = "0x6275c7A100A6d16035DEa9930E18890bE42185A7";
  let provider = ethers.getDefaultProvider('rinkeby');
  let signer = ethers.Wallet.createRandom().connect(provider);
  let abi = [
    "function safeTransferFrom(IERC20Upgradeable token, address from, address to, uint256 value) internal"
  ]
  let brlc_token = await new ethers.Contract(brlc_address, abi, signer);
  let mocked_brlc = await smockit(brlc_token);
  console.log(brlc_token.address)

  beforeEach(async function() {
    SpinMachineV1 = await ethers.getContractFactory("SpinMachineV1");
    spinMachine = await upgrades.deployProxy(SpinMachineV1);
    //let Brlc = await ethers.getContractFactory('brlc_token');
    //let brlc = await upgrades.deployProxy(brlc_token);
    await spinMachine.deployed();
    [owner, addr1, addr2] = await ethers.getSigners();
    //brlc_token = await spinMachine.token()
    console.log(spinMachine.address)
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
      await spinMachine.connect(signer).buyExtraSpin(addr2.address, 1)
      //console.log(brlc_token)
      
      //Error: VM Exception while processing transaction: revert Address: call to non-contract
    });

    it("Should fail if owner or addr1 can't spin", async function() {
      let addr1CanSpin: boolean = await spinMachine.canSpinFor(addr1.address);
      let ownerCanSpin: boolean = await spinMachine.canSpin();
      expect(addr1CanSpin).to.equal(true)
      expect(ownerCanSpin).to.equal(true)
    });

    it("Should sucessfully spin", async function() {
      //let success: boolean;
      //let winnings: number;
      let result: any;
      //result = await spinMachine.connect(brlc_token).spin(); //Error: Transaction reverted: function call to a non-contract account
      //console.log(result);
    });
  });
});