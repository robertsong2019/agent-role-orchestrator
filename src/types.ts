/**
 * Core types for the Agent Role Orchestrator system
 */

export type AgentRole = 'ceo' | 'manager' | 'worker';

export type TaskType = 'implementation' | 'testing' | 'documentation' | 'review';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

export interface Task {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  description: string;
  assignedTo?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentCapabilities {
  canCreateTasks: boolean;
  canAssignTasks: boolean;
  canExecuteTasks: boolean;
  canReviewTasks: boolean;
  canSetPriority: boolean;
  canAllocateResources: boolean;
}

export interface AgentContext {
  role: AgentRole;
  name: string;
  capabilities: AgentCapabilities;
  tools: string[];
}

export interface Message {
  from: AgentRole;
  to: AgentRole | 'all';
  type: 'request' | 'response' | 'status' | 'decision';
  content: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  status: 'planning' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  nextActions?: string[];
}
