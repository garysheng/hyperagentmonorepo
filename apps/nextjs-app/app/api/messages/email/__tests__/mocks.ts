import { vi } from 'vitest';

// Create mock instance that we can access in tests
export const mockEmailService = {
  formatEmailAddress: vi.fn().mockReturnValue({
    email: 'postmaster+team+celebrity-123@hyperagent.so',
    formatted: 'Test Celebrity Team <postmaster+team+celebrity-123@hyperagent.so>'
  }),
  sendEmail: vi.fn().mockResolvedValue({ id: 'test-message-id' })
};

// Mock the EmailService class
vi.mock('@/lib/email/mailgun', () => {
  return {
    EmailService: vi.fn().mockImplementation(() => mockEmailService)
  };
}); 