import { ethers } from 'ethers';
import { newKit } from '@celo/contractkit';
import Decimal from 'decimal.js';
import logger from '../utils/logger';
import { toSmallestUnit } from '../utils/conversions';

/**
 * Celo Service - Handles all blockchain interactions
 */
export class CeloService {
  private static instance: CeloService;
  private kit: any;
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    // Defer provider initialization to avoid blocking
  }

  static getInstance(): CeloService {
    if (!this.instance) {
      this.instance = new CeloService();
    }
    return this.instance;
  }

  /**
   * Initialize the provider (called on first use)
   */
  private ensureProvider(): void {
    if (!this.isInitialized) {
      const rpcUrl = process.env.CELO_RPC_URL || 'https://sepolia-forno.celo-testnet.org';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.kit = newKit(rpcUrl);
      this.isInitialized = true;
    }
  }

  /**
   * Initialize wallet with private key
   */
  initializeWallet(privateKey: string): void {
    this.ensureProvider();
    if (!privateKey) {
      throw new Error('Private key not configured in .env file');
    }
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.kit.connection.addAccount(privateKey);
    logger.info(`✓ Wallet initialized: ${this.wallet.address}`);
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return this.wallet.address;
  }

  /**
   * Get balance of an address in stablecoin
   */
  async getStablecoinBalance(address: string, stablecoinAddress: string): Promise<Decimal> {
    try {
      const erc20ABI = [
        'function balanceOf(address owner) public view returns (uint256)',
        'function decimals() public view returns (uint8)',
      ];

      const contract = new ethers.Contract(stablecoinAddress, erc20ABI, this.provider);
      const decimals = await contract.decimals();
      const balance = await contract.balanceOf(address);

      return new Decimal(balance.toString()).div(Decimal.pow(10, decimals));
    } catch (error) {
      logger.error({ error }, 'Failed to get stablecoin balance');
      throw error;
    }
  }

  /**
   * Transfer stablecoin to recipient
   */
  async transferStablecoin(
    recipient: string,
    amount: Decimal | number | string,
    stablecoinAddress: string,
    decimals: number = 18
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const erc20ABI = [
        'function transfer(address to, uint256 amount) public returns (bool)',
        'function decimals() public view returns (uint8)',
      ];

      const amountSmallest = toSmallestUnit(amount, decimals);
      const contract = new ethers.Contract(stablecoinAddress, erc20ABI, this.wallet);

      logger.info(
        `Transferring ${amount} tokens to ${recipient} from ${stablecoinAddress}`
      );

      const tx = await contract.transfer(recipient, amountSmallest.toFixed(0));
      const receipt = await tx.wait();

      logger.info({ txHash: receipt.transactionHash }, 'Transfer successful');
      return receipt.transactionHash;
    } catch (error) {
      logger.error({ error, recipient, amount }, 'Transfer failed');
      throw error;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<Decimal> {
    try {
      this.ensureProvider();
      if (!this.provider) throw new Error('Provider not initialized');
      const feeData = await this.provider.getFeeData();
      if (!feeData.gasPrice) {
        throw new Error('Unable to fetch gas price');
      }
      return new Decimal(feeData.gasPrice.toString());
    } catch (error) {
      logger.error({ error }, 'Failed to get gas price');
      throw error;
    }
  }

  /**
   * Estimate gas for transfer
   */
  async estimateTransferGas(
    recipient: string,
    stablecoinAddress: string
  ): Promise<Decimal> {
    try {
      this.ensureProvider();
      if (!this.provider) throw new Error('Provider not initialized');
      const erc20ABI = ['function transfer(address to, uint256 amount) public returns (bool)'];
      const contract = new ethers.Contract(stablecoinAddress, erc20ABI, this.provider);

      const gasEstimate = await contract.transfer.estimateGas(recipient, 0);
      return new Decimal(gasEstimate.toString());
    } catch (error) {
      logger.error({ error }, 'Failed to estimate gas');
      throw error;
    }
  }

  /**
   * Get provider for direct RPC calls
   */
  getProvider(): ethers.JsonRpcProvider {
    this.ensureProvider();
    if (!this.provider) throw new Error('Provider not initialized');
    return this.provider;
  }

  /**
   * Get ContractKit instance
   */
  getKit() {
    return this.kit;
  }
}

export default CeloService;
