import logger from '../utils/logger';

export type Network = 'sepolia' | 'mainnet';

interface DeploymentConfig {
  network: Network;
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  contracts: {
    cusdAddress: string;
    usdcAddress: string;
    moolaMarketAddress: string;
    agentscanRegistry: string;
  };
}

interface DeploymentStep {
  name: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp?: number;
  error?: string;
}

/**
 * Deployment Configuration Service - Manages network configurations and deployments
 */
export class DeploymentConfigService {
  private static instance: DeploymentConfigService;
  private currentNetwork: Network = 'sepolia';
  private deploymentHistory: DeploymentStep[] = [];

  private configs: Record<Network, DeploymentConfig> = {
    sepolia: {
      network: 'sepolia',
      rpcUrl: 'https://sepolia-forno.celo-testnet.org',
      chainId: 44787,
      explorerUrl: 'https://sepolia-blockscout.celo-testnet.org',
      contracts: {
        cusdAddress: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1',
        usdcAddress: '0x2a3684e9dc20b857375ea04235f2f7edbe816c29',
        moolaMarketAddress: '0x7d00e338514985a9f7a4af9e294726e360a00aea3',
        agentscanRegistry: '0x0000000000000000000000000000000000000000',
      },
    },
    mainnet: {
      network: 'mainnet',
      rpcUrl: 'https://forno.celo.org',
      chainId: 42220,
      explorerUrl: 'https://celoscan.io',
      contracts: {
        cusdAddress: '0x765DE816845861e75A25fCA122bb6DBF526a107C',
        usdcAddress: '0xef4229c8c3250C675F21BCefa42f58EfC254f4c7',
        moolaMarketAddress: '0x7d00e338514985a9f7a4af9e294726e360a00aea3',
        agentscanRegistry: '0x0000000000000000000000000000000000000000',
      },
    },
  };

  private constructor() {}

  static getInstance(): DeploymentConfigService {
    if (!this.instance) {
      this.instance = new DeploymentConfigService();
    }
    return this.instance;
  }

  /**
   * Get configuration for a network
   */
  getConfig(network: Network): DeploymentConfig {
    const config = this.configs[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    return config;
  }

  /**
   * Get current network configuration
   */
  getCurrentConfig(): DeploymentConfig {
    return this.getConfig(this.currentNetwork);
  }

  /**
   * Switch to a different network
   */
  switchNetwork(network: Network): void {
    if (!this.configs[network]) {
      throw new Error(`Unknown network: ${network}`);
    }
    this.currentNetwork = network;
    logger.info({ network }, 'Switched network');
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): Network {
    return this.currentNetwork;
  }

  /**
   * Record a deployment step
   */
  recordDeploymentStep(name: string, description: string, status: 'completed' | 'failed', error?: string): void {
    const step: DeploymentStep = {
      name,
      description,
      status,
      timestamp: Date.now(),
      error,
    };

    this.deploymentHistory.push(step);

    if (status === 'completed') {
      logger.info({ step }, `✓ Deployment step completed: ${name}`);
    } else {
      logger.error({ step }, `✗ Deployment step failed: ${name}`);
    }
  }

  /**
   * Get deployment history
   */
  getDeploymentHistory(): DeploymentStep[] {
    return this.deploymentHistory;
  }

  /**
   * Validate configuration for a network
   */
  validateConfig(network: Network): { valid: boolean; errors: string[] } {
    const config = this.configs[network];
    const errors: string[] = [];

    if (!config.rpcUrl) {
      errors.push('RPC URL not configured');
    }

    if (!config.contracts.cusdAddress || config.contracts.cusdAddress === '0x0000000000000000000000000000000000000000') {
      errors.push('cUSD address not configured');
    }

    if (!config.contracts.moolaMarketAddress || config.contracts.moolaMarketAddress === '0x0000000000000000000000000000000000000000') {
      errors.push('Moola Market address not configured');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get deployment checklist for a network
   */
  getDeploymentChecklist(network: Network): Record<string, boolean> {
    return {
      envVarsConfigured: !!process.env.AGENT_PRIVATE_KEY,
      walletFunded: false,
      contractsDeployed: false,
      agentRegistered: false,
      testsPass: true,
    };
  }
}

export default DeploymentConfigService;
