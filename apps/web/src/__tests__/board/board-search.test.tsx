import { render, screen, fireEvent } from '@testing-library/react';
import { BoardSearch } from '@/components/board/board-search';

describe('BoardSearch', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a searchbox input with correct placeholder', () => {
    render(<BoardSearch {...defaultProps} />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search tasks...');
  });

  it('calls onChange when user types in the input', () => {
    render(<BoardSearch {...defaultProps} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'bug fix' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('bug fix');
  });

  it('shows clear button when value is non-empty and clears on click', () => {
    const onChange = jest.fn();
    render(<BoardSearch value="hello" onChange={onChange} />);

    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when value is empty', () => {
    render(<BoardSearch {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });
});
