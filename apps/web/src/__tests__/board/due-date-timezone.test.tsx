import { render, screen } from '@testing-library/react';
import { DueDateTimezoneBreakdown } from '@/components/board/due-date-timezone';

describe('DueDateTimezoneBreakdown', () => {
  it('returns null when no assignee timezone or viewer timezone', () => {
    const { container } = render(
      <DueDateTimezoneBreakdown
        dueDate="2026-04-01T12:00:00Z"
        assignee={{ firstName: 'Alice' }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders assignee timezone entry when assignee has timezone', () => {
    render(
      <DueDateTimezoneBreakdown
        dueDate="2026-04-01T12:00:00Z"
        assignee={{ firstName: 'Alice', timezone: 'America/New_York' }}
      />,
    );

    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('renders viewer timezone entry when viewerTimezone is set', () => {
    render(
      <DueDateTimezoneBreakdown
        dueDate="2026-04-01T12:00:00Z"
        assignee={{ firstName: 'Alice', timezone: 'America/New_York' }}
        viewerTimezone="Asia/Tokyo"
      />,
    );

    expect(screen.getByText(/You/)).toBeInTheDocument();
  });

  it('shows day boundary warning when timezones cause different calendar days', () => {
    // Use a time near midnight UTC so that different timezones end up on different days
    render(
      <DueDateTimezoneBreakdown
        dueDate="2026-04-01T03:00:00Z"
        assignee={{ firstName: 'Bob', timezone: 'America/Los_Angeles' }}
        viewerTimezone="Asia/Tokyo"
      />,
    );

    expect(screen.getByText(/different day/i)).toBeInTheDocument();
  });

  it('does not show day boundary warning when both timezones share the same calendar day', () => {
    // Use a midday UTC time — both US Eastern and London stay on the same day
    render(
      <DueDateTimezoneBreakdown
        dueDate="2026-04-01T14:00:00Z"
        assignee={{ firstName: 'Carol', timezone: 'America/New_York' }}
        viewerTimezone="Europe/London"
      />,
    );

    expect(screen.queryByText(/different day/i)).not.toBeInTheDocument();
  });
});
