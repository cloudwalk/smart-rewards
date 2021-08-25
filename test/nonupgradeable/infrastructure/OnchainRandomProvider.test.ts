import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("OnhainRandomProvider", async () => {
  let OnchainRandomProvider: ContractFactory;
  let onchainRandomProvider: Contract;
  let deployer: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    OnchainRandomProvider = await ethers.getContractFactory("OnchainRandomProvider");
    onchainRandomProvider = await OnchainRandomProvider.deploy();
    await onchainRandomProvider.deployed();
    [deployer, other] = await ethers.getSigners();
  });

  it("Return random numbers", async () => {
    const randomNumber_1 = await onchainRandomProvider.getRandomness();

    // Wait for the next block
    await deployer.sendTransaction({ to: other.address, value: 100 });

    const randomNumber_2 = await onchainRandomProvider.getRandomness();

    // Wait for the next block
    await deployer.sendTransaction({ to: other.address, value: 100 });

    const randomNumber_3 = await onchainRandomProvider.getRandomness();

    // Get different number for each request
    expect(randomNumber_1).to.not.equal(randomNumber_2);
    expect(randomNumber_2).to.not.equal(randomNumber_3);
  });
});
