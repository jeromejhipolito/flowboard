export interface DemoLabel {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export const DEMO_LABELS: DemoLabel[] = [
  {
    id: 'demo-label-1',
    workspaceId: 'demo-workspace-1',
    name: 'Bug',
    color: '#ef4444',
  },
  {
    id: 'demo-label-2',
    workspaceId: 'demo-workspace-1',
    name: 'Feature',
    color: '#3b82f6',
  },
  {
    id: 'demo-label-3',
    workspaceId: 'demo-workspace-1',
    name: 'Enhancement',
    color: '#8b5cf6',
  },
  {
    id: 'demo-label-4',
    workspaceId: 'demo-workspace-1',
    name: 'Documentation',
    color: '#06b6d4',
  },
  {
    id: 'demo-label-5',
    workspaceId: 'demo-workspace-1',
    name: 'Urgent',
    color: '#f97316',
  },
];
