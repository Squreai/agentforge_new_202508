import type { Node, Edge } from "reactflow"

export interface WorkflowNode extends Node {
  type: string
  data: {
    label: string
    config?: any
    inputs?: any
    outputs?: any
  }
}

export interface WorkflowEdge extends Edge {
  data?: {
    condition?: string
    transform?: string
  }
}

export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables?: Record<string, any>
  status: "draft" | "active" | "paused" | "completed" | "error"
  createdAt: Date
  updatedAt: Date
}

export interface ExecutionContext {
  workflowId: string
  variables: Record<string, any>
  nodeResults: Record<string, any>
  currentNode?: string
  status: "running" | "completed" | "error" | "paused"
  startTime: Date
  endTime?: Date
  error?: string
}

// Node executor functions
export const nodeExecutors = {
  start: async (node: WorkflowNode, context: ExecutionContext) => {
    return { success: true, data: context.variables }
  },

  end: async (node: WorkflowNode, context: ExecutionContext) => {
    return { success: true, data: "Workflow completed" }
  },

  "api-call": async (node: WorkflowNode, context: ExecutionContext) => {
    const { url, method = "GET", headers = {}, body } = node.data.config || {}

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "API call failed" }
    }
  },

  "data-transform": async (node: WorkflowNode, context: ExecutionContext) => {
    const { transform } = node.data.config || {}
    const inputData = context.nodeResults[node.id] || {}

    try {
      // Simple transformation logic
      let result = inputData
      if (transform) {
        // Apply transformation (simplified)
        result = eval(`(${transform})(inputData)`)
      }
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Transform failed" }
    }
  },

  condition: async (node: WorkflowNode, context: ExecutionContext) => {
    const { condition } = node.data.config || {}
    const inputData = context.nodeResults[node.id] || {}

    try {
      const result = condition ? eval(condition) : true
      return { success: true, data: { condition: result, input: inputData } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Condition evaluation failed" }
    }
  },

  delay: async (node: WorkflowNode, context: ExecutionContext) => {
    const { duration = 1000 } = node.data.config || {}

    await new Promise((resolve) => setTimeout(resolve, duration))
    return { success: true, data: `Delayed for ${duration}ms` }
  },

  log: async (node: WorkflowNode, context: ExecutionContext) => {
    const { message } = node.data.config || {}
    const logMessage = message || `Log from node ${node.id}`

    console.log(`[Workflow ${context.workflowId}] ${logMessage}`)
    return { success: true, data: logMessage }
  },

  "ai-generate": async (node: WorkflowNode, context: ExecutionContext) => {
    const { prompt, model = "gpt-3.5-turbo" } = node.data.config || {}

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      data: {
        prompt,
        response: `AI generated response for: ${prompt}`,
        model,
        timestamp: new Date().toISOString(),
      },
    }
  },
}

export async function generateWorkflow(prompt: string): Promise<Workflow> {
  // Simulate AI-generated workflow creation
  await new Promise((resolve) => setTimeout(resolve, 500))

  const workflowId = `workflow_${Date.now()}`
  const nodes: WorkflowNode[] = [
    {
      id: "start",
      type: "start",
      position: { x: 100, y: 100 },
      data: { label: "Start" },
    },
    {
      id: "process",
      type: "ai-generate",
      position: { x: 300, y: 100 },
      data: {
        label: "AI Process",
        config: { prompt: prompt },
      },
    },
    {
      id: "end",
      type: "end",
      position: { x: 500, y: 100 },
      data: { label: "End" },
    },
  ]

  const edges: WorkflowEdge[] = [
    {
      id: "start-process",
      source: "start",
      target: "process",
    },
    {
      id: "process-end",
      source: "process",
      target: "end",
    },
  ]

  return {
    id: workflowId,
    name: `Generated Workflow`,
    description: `Workflow generated from prompt: ${prompt}`,
    nodes,
    edges,
    variables: {},
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function executeWorkflow(
  workflow: Workflow,
  initialVariables: Record<string, any> = {},
): Promise<ExecutionContext> {
  const context: ExecutionContext = {
    workflowId: workflow.id,
    variables: { ...workflow.variables, ...initialVariables },
    nodeResults: {},
    status: "running",
    startTime: new Date(),
  }

  try {
    // Find start node
    const startNode = workflow.nodes.find((node) => node.type === "start")
    if (!startNode) {
      throw new Error("No start node found in workflow")
    }

    // Execute nodes in order (simplified execution)
    const executedNodes = new Set<string>()
    const queue = [startNode.id]

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      if (executedNodes.has(nodeId)) continue

      const node = workflow.nodes.find((n) => n.id === nodeId)
      if (!node) continue

      context.currentNode = nodeId

      // Execute node
      const executor = nodeExecutors[node.type as keyof typeof nodeExecutors]
      if (executor) {
        const result = await executor(node, context)
        context.nodeResults[nodeId] = result

        if (!result.success) {
          context.status = "error"
          context.error = result.error
          break
        }
      }

      executedNodes.add(nodeId)

      // Find next nodes
      const outgoingEdges = workflow.edges.filter((edge) => edge.source === nodeId)
      for (const edge of outgoingEdges) {
        if (!executedNodes.has(edge.target)) {
          queue.push(edge.target)
        }
      }
    }

    if (context.status === "running") {
      context.status = "completed"
    }
  } catch (error) {
    context.status = "error"
    context.error = error instanceof Error ? error.message : "Unknown error"
  }

  context.endTime = new Date()
  return context
}

export async function generateCode(
  workflow: Workflow,
  language: "javascript" | "python" | "typescript" = "javascript",
): Promise<string> {
  // Generate code representation of the workflow
  await new Promise((resolve) => setTimeout(resolve, 300))

  const functionName = workflow.name.replace(/\s+/g, "").toLowerCase()

  switch (language) {
    case "javascript":
    case "typescript":
      return `
// Generated workflow: ${workflow.name}
${language === "typescript" ? "export " : ""}async function ${functionName}(variables${language === "typescript" ? ": Record<string, any>" : ""}) {
  console.log('Starting workflow: ${workflow.name}');
  
  ${workflow.nodes
    .map((node) => {
      switch (node.type) {
        case "api-call":
          return `  // API Call: ${node.data.label}
  const ${node.id}Result = await fetch('${node.data.config?.url || "https://api.example.com"}');`
        case "ai-generate":
          return `  // AI Generation: ${node.data.label}
  const ${node.id}Result = await generateAI('${node.data.config?.prompt || "Generate content"}');`
        case "log":
          return `  // Log: ${node.data.label}
  console.log('${node.data.config?.message || "Workflow step completed"}');`
        default:
          return `  // ${node.type}: ${node.data.label}`
      }
    })
    .join("\n")}
  
  console.log('Workflow completed: ${workflow.name}');
  return { success: true, results: 'Workflow executed successfully' };
}
      `.trim()

    case "python":
      return `
# Generated workflow: ${workflow.name}
import asyncio
import json

async def ${functionName}(variables):
    print(f"Starting workflow: ${workflow.name}")
    
    ${workflow.nodes
      .map((node) => {
        switch (node.type) {
          case "api-call":
            return `    # API Call: ${node.data.label}
    ${node.id}_result = await make_api_call('${node.data.config?.url || "https://api.example.com"}')`
          case "ai-generate":
            return `    # AI Generation: ${node.data.label}
    ${node.id}_result = await generate_ai('${node.data.config?.prompt || "Generate content"}')`
          case "log":
            return `    # Log: ${node.data.label}
    print('${node.data.config?.message || "Workflow step completed"}')`
          default:
            return `    # ${node.type}: ${node.data.label}`
        }
      })
      .join("\n")}
    
    print(f"Workflow completed: ${workflow.name}")
    return {"success": True, "results": "Workflow executed successfully"}
      `.trim()

    default:
      return `// Unsupported language: ${language}`
  }
}

// Utility functions
export function validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for start node
  const hasStart = workflow.nodes.some((node) => node.type === "start")
  if (!hasStart) {
    errors.push("Workflow must have a start node")
  }

  // Check for end node
  const hasEnd = workflow.nodes.some((node) => node.type === "end")
  if (!hasEnd) {
    errors.push("Workflow must have an end node")
  }

  // Check for orphaned nodes
  const connectedNodes = new Set<string>()
  workflow.edges.forEach((edge) => {
    connectedNodes.add(edge.source)
    connectedNodes.add(edge.target)
  })

  const orphanedNodes = workflow.nodes.filter(
    (node) => node.type !== "start" && node.type !== "end" && !connectedNodes.has(node.id),
  )

  if (orphanedNodes.length > 0) {
    errors.push(`Orphaned nodes found: ${orphanedNodes.map((n) => n.id).join(", ")}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getWorkflowStats(workflow: Workflow): any {
  return {
    nodeCount: workflow.nodes.length,
    edgeCount: workflow.edges.length,
    nodeTypes: workflow.nodes.reduce(
      (acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
    complexity: workflow.nodes.length + workflow.edges.length,
    hasLoops: hasWorkflowLoops(workflow),
  }
}

function hasWorkflowLoops(workflow: Workflow): boolean {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true
    if (visited.has(nodeId)) return false

    visited.add(nodeId)
    recursionStack.add(nodeId)

    const outgoingEdges = workflow.edges.filter((edge) => edge.source === nodeId)
    for (const edge of outgoingEdges) {
      if (dfs(edge.target)) return true
    }

    recursionStack.delete(nodeId)
    return false
  }

  const startNode = workflow.nodes.find((node) => node.type === "start")
  return startNode ? dfs(startNode.id) : false
}
