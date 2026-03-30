import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';

const mockSetTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: mockSetTheme }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct label for dark theme', () => {
    render(<ThemeToggle />);
    // sr-only span + tooltip span both contain the label
    expect(screen.getAllByText('Dark mode').length).toBeGreaterThanOrEqual(1);
  });

  it('has a title attribute matching the current theme label', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Dark mode');
  });

  it('calls setTheme with next theme on click (dark -> system)', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('calls setTheme exactly once per click', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    expect(mockSetTheme).toHaveBeenCalledTimes(2);
  });
});
