import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/hooks/use-sprints', () => ({
  useSprints: () => ({
    data: [
      { id: 's1', name: 'Sprint 1', status: 'ACTIVE', projectId: 'p1', startDate: '2026-03-01', endDate: '2026-03-14' },
      { id: 's2', name: 'Sprint 2', status: 'PLANNING', projectId: 'p1' },
      { id: 's3', name: 'Sprint 0', status: 'COMPLETED', projectId: 'p1', completedAt: '2026-02-28' },
    ],
  }),
  useActiveSprint: () => ({
    data: { id: 's1', name: 'Sprint 1', status: 'ACTIVE' },
  }),
}));

import { SprintSelector } from '@/components/sprint/sprint-selector';

describe('SprintSelector', () => {
  const defaultProps = {
    projectId: 'p1',
    value: null as string | null,
    onChange: jest.fn(),
    onCreateSprint: jest.fn(),
    onCompleteSprint: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<SprintSelector {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows "All Tasks" text when value is null', () => {
    render(<SprintSelector {...defaultProps} value={null} />);
    expect(screen.getByText(/all tasks/i)).toBeInTheDocument();
  });

  it('shows "Backlog" text when value is "backlog"', () => {
    render(<SprintSelector {...defaultProps} value="backlog" />);
    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<SprintSelector {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('opens dropdown when trigger button is clicked', () => {
    render(<SprintSelector {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // After click, dropdown items should be visible
    expect(screen.getByText(/create new sprint/i)).toBeInTheDocument();
  });

  it('shows sprint options in dropdown', () => {
    render(<SprintSelector {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
  });
});
