import logger from '../utils/logger';

interface AgentMetadata {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  address?: string;
}

/**
 * Agentscan Registry Service - Registers agent on Agentscan for discoverability
 * Placeholder for actual registry integration
 */
export class AgentscanService {
  private static instance: AgentscanService;
  private metadata: AgentMetadata | null = null;
  private registryAddress = process.env.AGENTSCAN_REGISTRY_ADDRESS;

  private constructor() {}

  static getInstance(): AgentscanService {
    if (!this.instance) {
      this.instance = new AgentscanService();
    }
    return this.instance;
  }

  /**
   * Register agent on Agentscan
   * In production, this would call the smart contract
   */
  async registerAgent(metadata: AgentMetadata): Promise<string> {
    this.metadata = metadata;

    logger.info({ metadata }, 'Registering agent on Agentscan');

    // In production, this would make a contract call to Agentscan registry
    const registrationId = `AGENT_${Date.now()}`;

    logger.info(
      {
        registrationId,
        name: metadata.name,
        capabilities: metadata.capabilities,
      },
      '✓ Agent registered on Agentscan'
    );

    return registrationId;
  }

  /**
   * Update agent metadata
   */
  async updateMetadata(metadata: Partial<AgentMetadata>): Promise<void> {
    if (!this.metadata) {
      throw new Error('Agent not registered yet');
    }

    this.metadata = { ...this.metadata, ...metadata };

    logger.info({ metadata: this.metadata }, 'Agent metadata updated');
  }

  /**
   * Get agent metadata
   */
  getMetadata(): AgentMetadata | null {
    return this.metadata;
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<{
    registered: boolean;
    name: string | null;
    capabilities: string[];
  }> {
    return {
      registered: this.metadata !== null,
      name: this.metadata?.name || null,
      capabilities: this.metadata?.capabilities || [],
    };
  }

  /**
   * Announce agent capabilities
   */
  announceCapabilities(): void {
    if (!this.metadata) {
      return;
    }

    logger.info(
      {
        agentName: this.metadata.name,
        capabilities: this.metadata.capabilities,
      },
      'Agent capabilities announced'
    );
  }
}

export default AgentscanService;
