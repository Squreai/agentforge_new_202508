export interface WorkflowStep {
  id: string
  name: string
  type: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  connections: Array<{
    from: string
    to: string
    condition?: string
  }>
}

export interface NodeExecutor {
  type: string
  execute: (config: any, input: any) => Promise<any>
}

export const nodeExecutors: Record<string, NodeExecutor> = {
  "http-request": {
    type: "http-request",
    execute: async (config: any, input: any) => {
      const { url, method = "GET", headers = {} } = config
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: method !== "GET" ? JSON.stringify(input) : undefined,
        })
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }
        return await response.json()
      } catch (error) {
        throw new Error(`HTTP request failed: ${error}`)
      }
    },
  },
  "data-transform": {
    type: "data-transform",
    execute: async (config: any, input: any) => {
      const { transformation } = config
      if (transformation === "uppercase" && typeof input === "string") {
        return input.toUpperCase()
      }
      if (transformation === "filter" && Array.isArray(input)) {
        return input.filter((item) => item !== null && item !== undefined)
      }
      return input
    },
  },
  condition: {
    type: "condition",
    execute: async (config: any, input: any) => {
      const { condition, trueValue, falseValue } = config
      let result = false
      if (condition === "exists") {
        result = input !== null && input !== undefined
      } else if (condition === "not_empty") {
        result = input && (typeof input !== "object" || Object.keys(input).length > 0)
      }
      return result ? trueValue : falseValue
    },
  },
  llm: {
    type: "llm",
    execute: async (config: any, input: any) => {
      const { prompt, model = "gpt-3.5-turbo" } = config
      return {
        response: `AI response to: ${prompt} with input: ${JSON.stringify(input)}`,
        model,
        timestamp: new Date().toISOString(),
      }
    },
  },
  "code-execution": {
    type: "code-execution",
    execute: async (config: any, input: any) => {
      const { code, language = "javascript" } = config
      // Simulate code execution
      return {
        output: `Executed ${language} code with input: ${JSON.stringify(input)}`,
        exitCode: 0,
        executedAt: new Date().toISOString(),
      }
    },
  },
}

export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executionHistory: Array<{
    workflowId: string
    executedAt: Date
    status: "success" | "error" | "running"
    result?: any
    error?: string
  }> = []

  async executeWorkflow(workflowId: string, input: any = {}): Promise<any> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const execution = {
      workflowId,
      executedAt: new Date(),
      status: "running" as const,
    }
    this.executionHistory.push(execution)

    try {
      let currentData = input

      // Execute steps in order
      for (const step of workflow.steps) {
        console.log(`Executing step: ${step.name}`)
        currentData = await this.executeStep(step, currentData)
      }

      execution.status = "success"
      execution.result = currentData
      return currentData
    } catch (error) {
      execution.status = "error"
      execution.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  }

  private async executeStep(step: WorkflowStep, input: any): Promise<any> {
    const executor = nodeExecutors[step.type]
    if (executor) {
      return await executor.execute(step.config, input)
    }

    console.log(`Unknown step type: ${step.type}`)
    return input
  }

  saveWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow)
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id)
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values())
  }

  deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id)
  }

  getExecutionHistory(): Array<{
    workflowId: string
    executedAt: Date
    status: "success" | "error" | "running"
    result?: any
    error?: string
  }> {
    return [...this.executionHistory]
  }

  validateWorkflow(workflow: WorkflowDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!workflow.name) {
      errors.push("Workflow name is required")
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push("Workflow must have at least one step")
    }

    // Validate connections
    for (const connection of workflow.connections) {
      const fromExists = workflow.steps.some((step) => step.id === connection.from)
      const toExists = workflow.steps.some((step) => step.id === connection.to)

      if (!fromExists) {
        errors.push(`Connection references non-existent step: ${connection.from}`)
      }
      if (!toExists) {
        errors.push(`Connection references non-existent step: ${connection.to}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

export async function generateWorkflow(description: string): Promise<WorkflowDefinition> {
  // Generate a workflow based on description
  const workflowId = `workflow-${Date.now()}`

  // Simple workflow generation logic
  const steps: WorkflowStep[] = []

  if (description.toLowerCase().includes("api") || description.toLowerCase().includes("http")) {
    steps.push({
      id: "http-step",
      name: "HTTP Request",
      type: "http-request",
      config: {
        url: "https://api.example.com/data",
        method: "GET",
      },
      position: { x: 100, y: 100 },
    })
  }

  if (description.toLowerCase().includes("transform") || description.toLowerCase().includes("process")) {
    steps.push({
      id: "transform-step",
      name: "Data Transform",
      type: "data-transform",
      config: {
        transformation: "filter",
      },
      position: { x: 300, y: 100 },
    })
  }

  if (description.toLowerCase().includes("ai") || description.toLowerCase().includes("llm")) {
    steps.push({
      id: "llm-step",
      name: "AI Processing",
      type: "llm",
      config: {
        prompt: "Process the following data",
        model: "gpt-3.5-turbo",
      },
      position: { x: 500, y: 100 },
    })
  }

  // If no specific steps identified, add a default step
  if (steps.length === 0) {
    steps.push({
      id: "default-step",
      name: "Default Processing",
      type: "data-transform",
      config: {
        transformation: "identity",
      },
      position: { x: 100, y: 100 },
    })
  }

  // Generate connections between steps
  const connections = []
  for (let i = 0; i < steps.length - 1; i++) {
    connections.push({
      from: steps[i].id,
      to: steps[i + 1].id,
    })
  }

  return {
    id: workflowId,
    name: `Generated Workflow`,
    description,
    steps,
    connections,
  }
}

export async function generateCode(workflow: WorkflowDefinition, language = "javascript"): Promise<string> {
  let code = ""

  switch (language.toLowerCase()) {
    case "javascript":
    case "js":
      code = `// Generated workflow: ${workflow.name}
async function executeWorkflow(input) {
  let result = input;
  
${workflow.steps
  .map(
    (step) => `  // Step: ${step.name}
  result = await executeStep_${step.id}(result);`,
  )
  .join("\n")}
  
  return result;
}

${workflow.steps
  .map(
    (step) => `
async function executeStep_${step.id}(input) {
  // ${step.type} step implementation
  console.log('Executing ${step.name}');
  return input; // Placeholder implementation
}`,
  )
  .join("\n")}

module.exports = { executeWorkflow };`
      break

    case "python":
    case "py":
      code = `# Generated workflow: ${workflow.name}
import asyncio
import json

async def execute_workflow(input_data):
    result = input_data
    
${workflow.steps
  .map(
    (step) => `    # Step: ${step.name}
    result = await execute_step_${step.id}(result)`,
  )
  .join("\n")}
    
    return result

${workflow.steps
  .map(
    (step) => `
async def execute_step_${step.id}(input_data):
    # ${step.type} step implementation
    print(f'Executing ${step.name}')
    return input_data  # Placeholder implementation`,
  )
  .join("\n")}

if __name__ == "__main__":
    # Example usage
    result = asyncio.run(execute_workflow({"test": "data"}))
    print(json.dumps(result, indent=2))`
      break

    default:
      code = `// Unsupported language: ${language}
// Workflow: ${workflow.name}
// Steps: ${workflow.steps.map((s) => s.name).join(", ")}`
  }

  return code
}

// Singleton instance
let workflowEngineInstance: WorkflowEngine | null = null

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance) {
    workflowEngineInstance = new WorkflowEngine()
  }
  return workflowEngineInstance
}

export default WorkflowEngine
