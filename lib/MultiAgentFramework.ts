import type { Agent } from "./agent-types"

export interface MultiAgentConfig {
  agents: Agent[]
  orchestrationStrategy: "sequential" | "parallel" | "conditional"
  communicationProtocol: "direct" | "message-queue" | "event-driven"
  maxConcurrency?: number
  timeout?: number
}

export interface AgentMessage {
  id: string
  from: string
  to: string
  type: "task" | "result" | "error" | "status"
  payload: any
  timestamp: number
}

export class MultiAgent {
  public id: string
  public name: string
  public role: string
  public capabilities: string[]
  public status: "idle" | "busy" | "error" | "offline"
  private messageQueue: AgentMessage[] = []

  constructor(config: {
    id: string
    name: string
    role: string
    capabilities: string[]
  }) {
    this.id = config.id
    this.name = config.name
    this.role = config.role
    this.capabilities = config.capabilities
    this.status = "idle"
  }

  async processTask(task: any): Promise<any> {
    this.status = "busy"
    try {
      // Simulate task processing
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const result = {
        taskId: task.id,
        result: `Processed by ${this.name}`,
        timestamp: Date.now(),
      }
      this.status = "idle"
      return result
    } catch (error) {
      this.status = "error"
      throw error
    }
  }

  sendMessage(message: AgentMessage): void {
    this.messageQueue.push(message)
  }

  getMessages(): AgentMessage[] {
    return [...this.messageQueue]
  }

  clearMessages(): void {
    this.messageQueue = []
  }
}

export class MultiAgentFramework {
  private agents: Map<string, MultiAgent> = new Map()
  private config: MultiAgentConfig
  private messageHistory: AgentMessage[] = []

  constructor(config: MultiAgentConfig) {
    this.config = config
    this.initializeAgents()
  }

  private initializeAgents(): void {
    this.config.agents.forEach((agentConfig) => {
      const agent = new MultiAgent({
        id: agentConfig.id,
        name: agentConfig.name,
        role: agentConfig.role || "worker",
        capabilities: agentConfig.capabilities || [],
      })
      this.agents.set(agent.id, agent)
    })
  }

  async executeTask(task: {
    id: string
    type: string
    data: any
    assignedAgents?: string[]
  }): Promise<any> {
    const targetAgents = task.assignedAgents || Array.from(this.agents.keys())

    switch (this.config.orchestrationStrategy) {
      case "sequential":
        return this.executeSequential(task, targetAgents)
      case "parallel":
        return this.executeParallel(task, targetAgents)
      case "conditional":
        return this.executeConditional(task, targetAgents)
      default:
        throw new Error(`Unknown orchestration strategy: ${this.config.orchestrationStrategy}`)
    }
  }

  private async executeSequential(task: any, agentIds: string[]): Promise<any> {
    const results = []
    for (const agentId of agentIds) {
      const agent = this.agents.get(agentId)
      if (agent) {
        const result = await agent.processTask(task)
        results.push(result)
      }
    }
    return results
  }

  private async executeParallel(task: any, agentIds: string[]): Promise<any> {
    const promises = agentIds.map((agentId) => {
      const agent = this.agents.get(agentId)
      return agent ? agent.processTask(task) : Promise.resolve(null)
    })
    return Promise.all(promises)
  }

  private async executeConditional(task: any, agentIds: string[]): Promise<any> {
    // Simple conditional logic - can be extended
    const firstAgent = this.agents.get(agentIds[0])
    if (firstAgent) {
      const result = await firstAgent.processTask(task)
      if (result && agentIds.length > 1) {
        const secondAgent = this.agents.get(agentIds[1])
        if (secondAgent) {
          return secondAgent.processTask({ ...task, previousResult: result })
        }
      }
      return result
    }
    return null
  }

  getAgent(id: string): MultiAgent | undefined {
    return this.agents.get(id)
  }

  getAllAgents(): MultiAgent[] {
    return Array.from(this.agents.values())
  }

  getAgentStatus(): Record<string, string> {
    const status: Record<string, string> = {}
    this.agents.forEach((agent, id) => {
      status[id] = agent.status
    })
    return status
  }

  broadcastMessage(message: Omit<AgentMessage, "id" | "timestamp">): void {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    this.messageHistory.push(fullMessage)
    this.agents.forEach((agent) => {
      if (agent.id !== message.from) {
        agent.sendMessage(fullMessage)
      }
    })
  }

  getMessageHistory(): AgentMessage[] {
    return [...this.messageHistory]
  }
}
