import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("OutchainRandomProvider", async () => {
  let OutchainRandomProvider: ContractFactory;
  let outchainRandomProvider: Contract;
  let deployer: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    OutchainRandomProvider = await ethers.getContractFactory("OutchainRandomProvider");
    outchainRandomProvider = await OutchainRandomProvider.deploy();
    await outchainRandomProvider.deployed();
    [deployer, other] = await ethers.getSigners();
  });

  describe("SetRandomNumber", async () => {
    // Default configuration
    const randomNumber: number = 10;

    beforeEach(async () => {
        // Make sure that random number hasn't been set yet
        expect(await outchainRandomProvider.getRandomness()).to.equal(0);
      });

    it("Set random number correctly", async () => {
      await outchainRandomProvider.setRandomNumber(randomNumber);
      expect(await outchainRandomProvider.getRandomness()).to.equal(randomNumber);
    });

    it("Fail to set random number (not owner)", async () => {
      await expect(outchainRandomProvider.connect(other).setRandomNumber(randomNumber)).to
        .be.reverted;
    });

    it("Emit RandomNumberChanged event", async () => {
      await expect(outchainRandomProvider.setRandomNumber(randomNumber))
        .to.emit(outchainRandomProvider, "RandomNumberChanged")
        .withArgs(randomNumber);
    });
  });
});
