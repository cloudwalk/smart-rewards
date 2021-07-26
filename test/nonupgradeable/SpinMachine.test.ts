import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("SpinMachine", async () => {
  let SpinMachine: ContractFactory;
  let spinMachine: Contract;
  let BRLCMock: ContractFactory;
  let brlcMock: Contract;
  let deployer: SignerWithAddress;
  let other1: SignerWithAddress;
  let other2: SignerWithAddress;

  beforeEach(async () => {
    // Deploy BRLC
    BRLCMock = await ethers.getContractFactory("ERC20Mock");
    brlcMock = await BRLCMock.deploy("BRL Coin", "BRLC", 6);
    await brlcMock.deployed();

    // Deploy RandomProvider
    const OnchainRandomProvider = await ethers.getContractFactory(
      "OnchainRandomProvider"
    );
    const onchainRandomProvider = await OnchainRandomProvider.deploy();
    await onchainRandomProvider.deployed();

    // Deploy SpinMachine
    SpinMachine = await ethers.getContractFactory("SpinMachine");
    spinMachine = await SpinMachine.deploy(brlcMock.address);
    await spinMachine.deployed();
    await spinMachine.setRandomProvider(onchainRandomProvider.address);

    // Get user accounts
    [deployer, other1, other2] = await ethers.getSigners();
  });

  describe("Configurations", async () => {
    describe("SetPrizes", async () => {
      // Default configuration
      const prizes: number[] = [10, 20, 30];

      it("Revert if called not by owner", async () => {
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.setPrizes(prizes)).to.be.reverted;
      });

      it("Update prizes if called by owner", async () => {
        await spinMachine.setPrizes(prizes);
        const new_prizes = await spinMachine.getPrizes();
        expect(new_prizes[0]).to.equal(prizes[0]);
        expect(new_prizes[1]).to.equal(prizes[1]);
        expect(new_prizes[2]).to.equal(prizes[2]);
      });

      it("Emit PrizesDistributionChanged event", async () => {
        const tx_result = await spinMachine.setPrizes(prizes);
        expect(tx_result)
          .to.emit(spinMachine, "PrizesDistributionChanged")
          .withArgs(prizes);
      });

      it("Complex scenario", async () => {
        // Revert if called not by owner
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.setPrizes(prizes)).to.be.reverted;

        // Update prizes if called by owner
        const tx_result = await spinMachine.setPrizes(prizes);
        const new_prizes = await spinMachine.getPrizes();
        expect(new_prizes[0]).to.equal(prizes[0]);
        expect(new_prizes[1]).to.equal(prizes[1]);
        expect(new_prizes[2]).to.equal(prizes[2]);

        // Emit PrizesDistributionChanged event
        expect(tx_result)
          .to.emit(spinMachine, "PrizesDistributionChanged")
          .withArgs(prizes);
      });
    });

    describe("SetFreeSpinDelay", async () => {
      // Default configuration
      const freeSpinDely: number = 10;

      it("Revert if called not by owner", async () => {
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.setFreeSpinDelay(freeSpinDely)).to.be.reverted;
      });

      it("Update free spin delay if called by owner", async () => {
        const old_freeSpinDely = await spinMachine.freeSpinDelay();
        await spinMachine.setFreeSpinDelay(freeSpinDely);
        const new_freeSpinDely = await spinMachine.freeSpinDelay();
        expect(old_freeSpinDely).to.not.equal(freeSpinDely);
        expect(new_freeSpinDely).to.equal(freeSpinDely);
      });

      it("Emit FreeSpinDelayChanged event", async () => {
        const old_freeSpinDely = await spinMachine.freeSpinDelay();
        const tx_result = await spinMachine.setFreeSpinDelay(freeSpinDely);
        expect(tx_result)
          .to.emit(spinMachine, "FreeSpinDelayChanged")
          .withArgs(freeSpinDely, old_freeSpinDely);
      });

      it("Complex scenario", async () => {
        // Revert if called not by owner
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.setFreeSpinDelay(freeSpinDely)).to.be.reverted;

        // Update free spin delay if called by owner
        const old_freeSpinDely = await spinMachine.freeSpinDelay();
        const tx_result = await spinMachine.setFreeSpinDelay(freeSpinDely);
        const new_freeSpinDely = await spinMachine.freeSpinDelay();
        expect(old_freeSpinDely).to.not.equal(freeSpinDely);
        expect(new_freeSpinDely).to.equal(freeSpinDely);

        // Emit FreeSpinDelayChanged event
        expect(tx_result)
          .to.emit(spinMachine, "FreeSpinDelayChanged")
          .withArgs(freeSpinDely, old_freeSpinDely);
      });
    });

    describe("SetExtraSpinPrice", async () => {
      // Default configuration
      const extraSpinPrice: number = 10;

      it("Revert if called not by owner", async () => {
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.setExtraSpinPrice(extraSpinPrice)).to.be.reverted;
      });

      it("Update extra spin price if called by owner", async () => {
        const old_extraSpinPrice = await spinMachine.extraSpinPrice();
        await spinMachine.setExtraSpinPrice(extraSpinPrice);
        const new_extraSpinPrice = await spinMachine.extraSpinPrice();
        expect(old_extraSpinPrice).to.not.equal(extraSpinPrice);
        expect(new_extraSpinPrice).to.equal(extraSpinPrice);
      });

      it("Emit FreeSpinDelayChanged event", async () => {
        const old_extraSpinPrice = await spinMachine.extraSpinPrice();
        const tx_result = await spinMachine.setExtraSpinPrice(extraSpinPrice);
        expect(tx_result)
          .to.emit(spinMachine, "ExtraSpinPriceChanged")
          .withArgs(extraSpinPrice, old_extraSpinPrice);
      });

      it("Complex scenario", async () => {
        // Revert if called not by owner
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.setExtraSpinPrice(extraSpinPrice)).to.be.reverted;

        // Update extra spin price if called by owner
        const old_extraSpinPrice = await spinMachine.extraSpinPrice();
        const tx_result = await spinMachine.setExtraSpinPrice(extraSpinPrice);
        const new_extraSpinPrice = await spinMachine.extraSpinPrice();
        expect(old_extraSpinPrice).to.not.equal(extraSpinPrice);
        expect(new_extraSpinPrice).to.equal(extraSpinPrice);

        // Emit FreeSpinDelayChanged event
        expect(tx_result)
          .to.emit(spinMachine, "ExtraSpinPriceChanged")
          .withArgs(extraSpinPrice, old_extraSpinPrice);
      });
    });

    describe("GrantExtraSpin", async () => {
      // Default Configuration
      const extraSpinsCount: number = 10;
      it("Revert if called not by owner", async () => {
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.grantExtraSpin(other1.address, extraSpinsCount)).to
          .be.reverted;
      });

      it("Update extra spins count if called by owner", async () => {
        const old_spinsCount = await spinMachine.extraSpins(other1.address);
        await spinMachine.grantExtraSpin(other1.address, extraSpinsCount);
        const new_spinsCount = await spinMachine.extraSpins(other1.address);
        expect(new_spinsCount).to.equal(old_spinsCount + extraSpinsCount);
      });

      it("Emit ExtraSpinGranted event", async () => {
        const tx_result = await spinMachine.grantExtraSpin(
          other1.address,
          extraSpinsCount
        );
        expect(tx_result)
          .to.emit(spinMachine, "ExtraSpinGranted")
          .withArgs(deployer.address, other1.address, extraSpinsCount);
      });

      it("Complex scenario", async () => {
        // Revert if called not by owner
        const fromOtherWallet = spinMachine.connect(other1);
        await expect(fromOtherWallet.grantExtraSpin(other1.address, extraSpinsCount)).to
          .be.reverted;

        // Update extra spins count if called by owner
        const old_spinsCount = await spinMachine.extraSpins(other1.address);
        const tx_result = await spinMachine.grantExtraSpin(
          other1.address,
          extraSpinsCount
        );
        const new_spinsCount = await spinMachine.extraSpins(other1.address);
        expect(new_spinsCount).to.equal(old_spinsCount + extraSpinsCount);

        // Emit ExtraSpinGranted event
        expect(tx_result)
          .to.emit(spinMachine, "ExtraSpinGranted")
          .withArgs(deployer.address, other1.address, extraSpinsCount);
      });
    });
  });

  describe("Interactions", async () => {
    // Default configuration
    const prize: number = 100;
    const prizes: number[] = [prize];
    const freeSpinDelay: number = 1000;
    const extraSpinPrice: number = prize;

    beforeEach(async () => {
      // Configure spin machine
      await spinMachine.setExtraSpinPrice(extraSpinPrice);
      await spinMachine.setFreeSpinDelay(freeSpinDelay);
      await spinMachine.setPrizes(prizes);

      // Required approvals
      await brlcMock.connect(other1).approve(spinMachine.address, 1000);
      await brlcMock.connect(other2).approve(spinMachine.address, 1000);
    });

    describe("BuyExtraSpin", async () => {
      // Default configuration
      const spinsCount: number = 10;

      it("Revert if user has not enough token balance", async () => {
        await brlcMock.mintTo(other1.address, extraSpinPrice * spinsCount - 1);
        await expect(spinMachine.connect(other1).buyExtraSpin(other1.address, spinsCount))
          .to.be.reverted;
      });

      it("Increase extra spins count correctly", async () => {
        await brlcMock.mintTo(other1.address, extraSpinPrice * spinsCount);
        const old_SpinsCount = await spinMachine.extraSpins(other1.address);
        await spinMachine.connect(other1).buyExtraSpin(other1.address, spinsCount);
        const new_SpinsCount = await spinMachine.extraSpins(other1.address);
        expect(new_SpinsCount).to.equal(old_SpinsCount + spinsCount);
      });

      it("Transfer correnct amount of tokens", async () => {
        const tokenAmont = spinsCount * extraSpinPrice;
        await brlcMock.mintTo(other1.address, tokenAmont);
        await expect(() =>
          spinMachine.connect(other1).buyExtraSpin(other1.address, spinsCount)
        ).to.changeTokenBalances(
          brlcMock,
          [other1, spinMachine],
          [-tokenAmont, tokenAmont]
        );
      });

      it("Emit ExtraSpinPurchased event", async () => {
        await brlcMock.mintTo(other1.address, extraSpinPrice * spinsCount);
        const tx_result = await spinMachine
          .connect(other1)
          .buyExtraSpin(other2.address, spinsCount);
        expect(tx_result)
          .to.emit(spinMachine, "ExtraSpinPurchased")
          .withArgs(other1.address, other2.address, spinsCount);
      });
    });

    describe("Free spin scenarios", async () => {
      beforeEach(async () => {
        // Only free spin is available
        expect(await spinMachine.canFreeSpin(other1.address)).to.equal(true);
        expect(await spinMachine.extraSpins(other1.address)).to.equal(0);
      });

      describe("Spin when SpinMachine has zero token balance", async () => {
        beforeEach(async () => {
          // Spin machine has zero token balance
          expect(await brlcMock.balanceOf(spinMachine.address)).to.equal(0);
        });

        it("Do not transfer any tokens", async () => {
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [0, 0]
          );
        });

        it("Do not spend free spin", async () => {
          const old_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          await spinMachine.connect(other1).spin();
          expect(await spinMachine.canSpin(other1.address)).to.equal(true);
          expect(await spinMachine.lastFreeSpin(other1.address)).to.equal(
            old_lastFreeSpin
          );
        });
      });

      describe("Spin when SpinMachine has not enough token balance", async () => {
        // Default configuration
        const tokenBalanceNotEnough: number = prize - 1;

        beforeEach(async () => {
          // Spin machine has 'not enough' token balance
          await brlcMock.mintTo(spinMachine.address, tokenBalanceNotEnough);
          expect(await brlcMock.balanceOf(spinMachine.address)).to.equal(
            tokenBalanceNotEnough
          );
        });

        it("Transfer correct amount of tokens", async () => {
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [-tokenBalanceNotEnough, tokenBalanceNotEnough]
          );
        });

        it("Spend free spin and update delay period", async () => {
          const old_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          const tx_result = await spinMachine.connect(other1).spin();
          const block = await ethers.provider.getBlock(tx_result.blockNumber);
          const new_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          expect(await spinMachine.canSpin(other1.address)).to.equal(false);
          expect(new_lastFreeSpin).to.not.equal(old_lastFreeSpin);
          expect(new_lastFreeSpin).to.equal(block.timestamp);
        });

        it("Emit Spin event", async () => {
          const tx_result = await spinMachine.connect(other1).spin();
          expect(tx_result)
            .to.emit(spinMachine, "Spin")
            .withArgs(other1.address, prize, tokenBalanceNotEnough, false);
        });
      });

      describe("Spin when SpinMachine has normal (enough) token balance", async () => {
        // Default configuration
        const tokenBalanceEnough: number = prize + 1;

        beforeEach(async () => {
          // Spin machine has 'enough' token balance
          await brlcMock.mintTo(spinMachine.address, tokenBalanceEnough);
          expect(await brlcMock.balanceOf(spinMachine.address)).to.equal(
            tokenBalanceEnough
          );
        });

        it("Transfer correct amount of tokens", async () => {
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [-prize, prize]
          );
        });

        it("Spend free spin and update delay period", async () => {
          const old_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          const tx_result = await spinMachine.connect(other1).spin();
          const block = await ethers.provider.getBlock(tx_result.blockNumber);
          const new_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          expect(await spinMachine.canSpin(other1.address)).to.equal(false);
          expect(new_lastFreeSpin).to.not.equal(old_lastFreeSpin);
          expect(new_lastFreeSpin).to.equal(block.timestamp);
        });

        it("No multiple free spins in a row", async () => {
          // First spin
          await spinMachine.connect(other1).spin();
          expect(await spinMachine.canFreeSpin(other1.address)).to.equal(false);
          expect(await brlcMock.balanceOf(spinMachine.address)).to.gt(0);

          // Second spin
          const old_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [0, 0]
          );
          const new_lastFreeSpin = await spinMachine.lastFreeSpin(other1.address);
          expect(new_lastFreeSpin).to.equal(old_lastFreeSpin);
        });

        it("Emit Spin event", async () => {
          const tx_result = await spinMachine.connect(other1).spin();
          expect(tx_result)
            .to.emit(spinMachine, "Spin")
            .withArgs(other1.address, prize, prize, false);
        });
      });
    });

    describe("Extra spin scenarios", async () => {
      const extraSpinsCount: number = 1;

      beforeEach(async () => {
        // Grant extra spin
        await spinMachine.grantExtraSpin(other1.address, extraSpinsCount);

        // Simulate free spin
        await brlcMock.mintTo(spinMachine.address, prize);
        await spinMachine.connect(other1).spin();

        // No free spin available, but extras spins are available
        expect(await spinMachine.canFreeSpin(other1.address)).to.equal(false);
        expect(await spinMachine.extraSpins(other1.address)).to.equal(extraSpinsCount);
      });

      describe("Spin when SpinMachine has zero token balance", async () => {
        beforeEach(async () => {
          // Spin machine has zero token balance
          expect(await brlcMock.balanceOf(spinMachine.address)).to.equal(0);
        });

        it("Do not transfer any tokens", async () => {
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [0, 0]
          );
        });

        it("Do not spend extra spins", async () => {
          await spinMachine.connect(other1).spin();
          expect(await spinMachine.extraSpins(other1.address)).to.equal(extraSpinsCount);
        });
      });

      describe("Spin when SpinMachine has not enough token balance", async () => {
        // Default configuration
        const tokenBalanceNotEnough: number = prize - 1;

        beforeEach(async () => {
          // Spin machine has 'not enough' token balance
          await brlcMock.mintTo(spinMachine.address, tokenBalanceNotEnough);
          expect(await brlcMock.balanceOf(spinMachine.address)).to.equal(
            tokenBalanceNotEnough
          );
        });

        it("Transfer correct amount of tokens", async () => {
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [-tokenBalanceNotEnough, tokenBalanceNotEnough]
          );
        });

        it("Spend extra spins correctly", async () => {
          const old_extraSpins = await spinMachine.extraSpins(other1.address);
          await spinMachine.connect(other1).spin();
          const new_extraSpins = await spinMachine.extraSpins(other1.address);
          expect(await spinMachine.canSpin(other1.address)).to.equal(false);
          expect(new_extraSpins).to.equal(old_extraSpins - 1);
        });

        it("Emit Spin event", async () => {
          const tx_result = await spinMachine.connect(other1).spin();
          expect(tx_result)
            .to.emit(spinMachine, "Spin")
            .withArgs(other1.address, prize, tokenBalanceNotEnough, true);
        });
      });

      describe("Spin when SpinMachine has normal (enough) token balance", async () => {
        // Default configuration
        const tokenBalanceEnough: number = prize + 1;

        beforeEach(async () => {
          // Spin machine has 'enough' token balance
          await brlcMock.mintTo(spinMachine.address, tokenBalanceEnough);
          expect(await brlcMock.balanceOf(spinMachine.address)).to.equal(
            tokenBalanceEnough
          );
        });

        it("Transfer correct amount of tokens 1", async () => {
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [-prize, prize]
          );
        });

        it("Transfer correct amount of tokens 2", async () => {
          // First spin
          await spinMachine.connect(other1).spin();
          expect(await spinMachine.extraSpins(other1.address)).to.equal(0);
          expect(await brlcMock.balanceOf(spinMachine.address)).to.gt(0);

          // Second spin
          await expect(() => spinMachine.connect(other1).spin()).to.changeTokenBalances(
            brlcMock,
            [spinMachine, other1],
            [0, 0]
          );
        });

        it("Spend extra spins correctly", async () => {
          const old_extraSpins = await spinMachine.extraSpins(other1.address);
          await spinMachine.connect(other1).spin();
          const new_extraSpins = await spinMachine.extraSpins(other1.address);
          expect(await spinMachine.canSpin(other1.address)).to.equal(false);
          expect(new_extraSpins).to.equal(old_extraSpins - 1);
        });

        it("Emit Spin event", async () => {
          const tx_result = await spinMachine.connect(other1).spin();
          expect(tx_result)
            .to.emit(spinMachine, "Spin")
            .withArgs(other1.address, prize, prize, true);
        });
      });
    });
  });
});
