import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '@/components/board/task-card';

// Mock @dnd-kit/sortable to avoid DnD context requirements
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: { toString: () => undefined },
  },
}));

const baseTask = {
  id: 'task-1',
  projectId: 'proj-1',
  title: 'Fix login bug',
  description: null,
  status: 'TODO' as const,
  priority: 'HIGH' as const,
  assigneeId: null,
  reporterId: 'user-1',
  position: 1,
  dueDate: null,
  sprintId: null,
  storyPoints: null,
  createdAt: '2026-03-20T00:00:00Z',
  updatedAt: '2026-03-20T00:00:00Z',
  deletedAt: null,
  assignee: null,
  labels: [],
  _count: { comments: 0, childTasks: 0 },
};

describe('TaskCard', () => {
  const defaultProps = {
    task: baseTask,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the task title', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
  });

  it('renders the priority badge', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('has role="button" and aria-label', () => {
    render(<TaskCard {...defaultProps} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Fix login bug'));
  });

  it('calls onClick when clicked', () => {
    render(<TaskCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('renders in compact mode with only title and priority', () => {
    render(<TaskCard {...defaultProps} density="compact" />);

    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows overdue styling for past due dates', () => {
    const overdueTask = {
      ...baseTask,
      dueDate: '2020-01-01T00:00:00Z', // definitely in the past
      status: 'TODO' as const,
    };

    render(<TaskCard task={overdueTask} onClick={jest.fn()} />);

    // The card aria-label includes "Overdue." when task is overdue
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Overdue'));
  });
});
