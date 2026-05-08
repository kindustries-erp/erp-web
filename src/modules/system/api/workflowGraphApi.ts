import axiosInstance from "@/core/api/axiosInstance";

export interface WorkflowNode {
  id: string;
  type: "module" | "process" | "status";
  label: string;
  labelEn: string;
  description: string;
  group: string;
  meta: {
    color: string;
    icon: string;
    endpoints?: string[];
    statusValue?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type:
    | "depends_on"
    | "creates"
    | "triggers"
    | "reads"
    | "belongs_to"
    | "settles"
    | "workflow_transition";
  meta: {
    description: string;
    field?: string;
  };
}

export interface WorkflowGroup {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  description: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  groups: WorkflowGroup[];
  meta: {
    version: string;
    generatedAt: string;
    totalNodes: number;
    totalEdges: number;
    totalGroups: number;
  };
}

export async function getWorkflowGraphApi(): Promise<WorkflowGraph> {
  const { data } = await axiosInstance.get<WorkflowGraph>("/workflow-graph");
  return data;
}
