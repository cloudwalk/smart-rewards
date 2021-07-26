import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory, Contract, Wallet } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("Faucet", async () => {
  let Faucet: ContractFactory;
  let faucet: Contract;
  let deployer: SignerWithAddress;
  let other1: SignerWithAddress;
  let other2: SignerWithAddress;

  beforeEach(async () => {
    // Deploy faucet
    Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy();
    await faucet.deployed();

    // Get user accounts
    [deployer, other1, other2] = await ethers.getSigners();
  });

  it("Is faucet", async () => {
    expect(await faucet.isFaucet()).to.equal(true);
  });

  describe("Configure", async () => {
    // Default configuration
    let minBalance: number = 100;
    let desiredBalance: number = 200;

    beforeEach(async () => {
      // Make sure no configurations have been made
      expect(await faucet.recipientMinBalance()).to.equal(0);
      expect(await faucet.recipientDesiredBalance()).to.equal(0);
    });

    it("Configure balances", async () => {
      await faucet.configure(minBalance, desiredBalance);
      expect(await faucet.recipientMinBalance()).to.equal(minBalance);
      expect(await faucet.recipientDesiredBalance()).to.equal(desiredBalance);
    });

    it("Fail to configure balances (not owner)", async () => {
      const fromOtherWallet = faucet.connect(other1);
      await expect(fromOtherWallet.configure(minBalance, desiredBalance)).to.be.reverted;
    });

    it("Emit Configure event", async () => {
      await expect(faucet.configure(minBalance, desiredBalance))
        .to.emit(faucet, "Configure")
        .withArgs(minBalance, desiredBalance);
    });
  });

  describe("SetWhitelist", async () => {
    beforeEach(async () => {
      // Make sure 'other' address isn't whitelisted
      expect(await faucet.whitelist(other1.address)).to.equal(false);
    });

    it("Whitelist address", async () => {
      // Whitelist
      await faucet.setWhitelist(other1.address, true);
      expect(await faucet.whitelist(other1.address)).to.equal(true);

      // Blacklist
      await faucet.setWhitelist(other1.address, false);
      expect(await faucet.whitelist(other1.address)).to.equal(false);
    });

    it("Fail to whitelist address (not owner)", async () => {
      const fromOtherWallet = faucet.connect(other1);
      await expect(fromOtherWallet.setWhitelist(other1.address, true)).to.be.reverted;
    });

    it("Emit Whitelist event", async () => {
      await expect(faucet.setWhitelist(other1.address, true))
        .to.emit(faucet, "Whitelist")
        .withArgs(other1.address, true);
    });
  });

  describe("Deposit", async () => {
    // Default configuration
    const depositAmount: number = 1000;

    it("Deposit some Ether", async () => {
      await expect(
        await faucet.connect(other1).deposit({ value: depositAmount })
      ).to.changeEtherBalances([other1, faucet], [-depositAmount, depositAmount]);
    });

    it("Emit Deposit event", async () => {
      await expect(await faucet.connect(other1).deposit({ value: depositAmount }))
        .to.emit(faucet, "Deposit")
        .withArgs(other1.address, depositAmount);
    });
  });

  describe("Withdraw", async () => {
    // Default configuration
    const minBalance: number = 1000000000000000; // 0.001 ETH
    const desiredBalance: number = 5000000000000000; // 0.005 ETH
    const faucetBalance: number = 8000000000000000; // 0.008 ETH
    let walletTo: Wallet;

    beforeEach(async () => {
      // Create an empty wallet
      walletTo = ethers.Wallet.createRandom();

      // Configure and deposit faucet
      await faucet.setWhitelist(other1.address, true);
      await faucet.configure(minBalance, desiredBalance);
      await faucet.deposit({ value: faucetBalance });
    });

    it("Withdraw desired Ether amount", async () => {
      // Set user balance
      const walletBalance = minBalance - 1;
      await deployer.sendTransaction({ to: walletTo.address, value: walletBalance });
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(walletBalance);

      // Withdraw
      const tx_result = await faucet.connect(other1).withdraw(walletTo.address);
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(desiredBalance);

      // Emit event
      expect(tx_result)
        .to.emit(faucet, "Withdraw")
        .withArgs(other1.address, walletTo.address, desiredBalance - walletBalance);
    });

    it("Withdraw entire faucet balance if 'not enough'", async () => {
      // Set user balance
      const walletBalance = minBalance - 1;
      await deployer.sendTransaction({ to: walletTo.address, value: walletBalance });
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(walletBalance);

      // Set 'not enogh' faucet balance
      await faucet.withdrawAll(other1.address, desiredBalance);
      let notEnoughBalance = await ethers.provider.getBalance(faucet.address);
      expect(desiredBalance).to.gt(notEnoughBalance);

      // Withdraw
      const tx_result = await faucet.connect(other1).withdraw(walletTo.address);
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(
        notEnoughBalance.toNumber() + walletBalance
      );

      // Emit event
      expect(tx_result)
        .to.emit(faucet, "Withdraw")
        .withArgs(other1.address, walletTo.address, notEnoughBalance);
    });

    it("Do not withdraw if user has enough balance", async () => {
      // Set user balance
      const walletBalance = minBalance + 1;
      await deployer.sendTransaction({ to: walletTo.address, value: walletBalance });
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(walletBalance);

      // Withdraw
      await faucet.connect(other1).withdraw(walletTo.address);
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(walletBalance);
    });

    it("Do not withdraw if not whitelisted sender", async () => {
      // Set user balance
      const walletBalance = minBalance - 1;
      await deployer.sendTransaction({ to: walletTo.address, value: walletBalance });
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(walletBalance);

      // Withdraw
      await faucet.connect(other2).withdraw(walletTo.address);
      expect(await ethers.provider.getBalance(walletTo.address)).to.equal(walletBalance);
    });
  });

  describe("WithdrawAll", async () => {
    // Default configuration
    const faucetBalance: number = 1000;

    beforeEach(async () => {
      // Make sure faucet has some Ether balance
      await expect(await faucet.deposit({ value: faucetBalance })).to.changeEtherBalance(
        faucet,
        faucetBalance
      );
    });

    it("Withdraw all Ether balance", async () => {
      await expect(
        await faucet.withdrawAll(other1.address, faucetBalance)
      ).to.changeEtherBalances([faucet, other1], [-faucetBalance, faucetBalance]);
    });

    it("Fail to withdraw all Ether balance (not owner)", async () => {
      await expect(faucet.connect(other1).withdrawAll(other1.address, faucetBalance)).to
        .be.reverted;
    });
  });
});
