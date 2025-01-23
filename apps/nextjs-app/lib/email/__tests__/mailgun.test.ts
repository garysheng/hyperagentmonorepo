import { describe, it, expect, beforeEach } from 'vitest';
import { EmailService } from '../mailgun';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    process.env.MAILGUN_API_KEY = 'test-key';
    process.env.MAILGUN_DOMAIN = 'test.domain.com';
    emailService = new EmailService();
  });

  describe('getCelebrityIdFromEmail', () => {
    const validTestCases = [
      {
        email: 'team+123@domain.com',
        expected: '123',
        description: 'Regular format'
      },
      {
        email: 'postmaster+team+456@domain.com',
        expected: '456',
        description: 'Sandbox format'
      },
      {
        email: 'postmaster+team+abc-123@domain.com',
        expected: 'abc-123',
        description: 'Complex ID with hyphen'
      },
      {
        email: 'postmaster+team+uuid@domain.com',
        expected: 'uuid',
        description: 'UUID format'
      }
    ];

    validTestCases.forEach(({ email, expected, description }) => {
      it(`should extract celebrity ID from ${description}`, () => {
        // @ts-ignore - accessing private method for testing
        const result = emailService.getCelebrityIdFromEmail(email);
        expect(result).toBe(expected);
      });
    });

    const invalidEmails = [
      'invalid@domain.com',
      'postmaster@domain.com',
      'team@domain.com',
      'postmaster+other+123@domain.com'
    ];

    invalidEmails.forEach(email => {
      it(`should throw error for invalid format: ${email}`, () => {
        expect(() => {
          // @ts-ignore - accessing private method for testing
          emailService.getCelebrityIdFromEmail(email);
        }).toThrow('Invalid email format');
      });
    });
  });

  describe('formatEmailAddress', () => {
    it('should format email address with postmaster prefix for sandbox domain', () => {
      const result = emailService.formatEmailAddress('123', 'Test Celebrity');
      expect(result.email).toBe('postmaster+team+123@test.domain.com');
      expect(result.formatted).toBe('Test Celebrity Team <postmaster+team+123@test.domain.com>');
    });
  });
}); 