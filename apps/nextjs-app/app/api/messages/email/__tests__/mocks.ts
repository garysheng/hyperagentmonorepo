import { vi } from 'vitest';

// Create mock instance that we can access in tests
export const mockEmailService = {
  formatEmailAddress: vi.fn().mockReturnValue({
    email: 'test@example.com',
    formatted: 'Test Celebrity Team <test@example.com>'
  }),
  sendEmail: vi.fn().mockResolvedValue({ id: 'test-message-id' })
};

// Mock the EmailService class
vi.mock('@/lib/email/mailgun', () => ({
  EmailService: vi.fn().mockImplementation(() => mockEmailService)
})); 