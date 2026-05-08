import axiosInstance from '../../../core/api/axiosInstance';

export interface EmployeeSnippet {
  id: string;
  name: string;
  position: string;
}

export interface StatusDef {
  value: string;
  label: string;
  color: string;
  terminal: boolean;
}

export interface NodeMeta {
  color: string;
  icon: string;
  endpoints?: string[];
  parentId?: string;
  statusValue?: string;
  terminal?: boolean;
}

export interface WorkflowNode extends Record<string, unknown> {
  id: string;
  type: 'root' | 'admin' | 'department' | 'process' | 'status';
  level: number;
  label: string;
  description: string;
  group: string;
  employees: EmployeeSnippet[];
  roles: string[];
  rules: string[];
  statuses: StatusDef[];
  meta: NodeMeta;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'hierarchy' | 'manages' | 'process_step' | 'workflow_transition';
  rule?: string;
  actor?: string;
  meta: { description: string };
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  meta: {
    version: string;
    generatedAt: string;
    layout: 'vertical';
    totalNodes: number;
    totalEdges: number;
  };
}

export async function getWorkflowGraphApi(): Promise<WorkflowGraph> {
  const res = await axiosInstance.get<WorkflowGraph>('/api/v1/workflow-graph');
  return res.data;
}
