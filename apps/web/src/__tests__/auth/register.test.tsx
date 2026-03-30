import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockRegister = jest.fn();
const mockPush = jest.fn();

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    register: mockRegister,
    login: jest.fn(),
    isAuthenticated: false,
    isLoading: false,
    user: null,
    accessToken: null,
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/demo', () => ({ isDemoMode: false }));

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }));

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders first name input', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
  });

  it('renders last name input', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders password input with type="password"', () => {
    render(<RegisterPage />);
    const pwd = screen.getByPlaceholderText('At least 8 characters');
    expect(pwd).toHaveAttribute('type', 'password');
  });

  it('renders Create Account button', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterPage />);
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('renders without crashing', () => {
    const { container } = render(<RegisterPage />);
    expect(container).toBeTruthy();
  });
});
