# Team Signup & Role Assignment Flows

## Overview

Hyperagent has two distinct signup flows:
1. **Direct Celebrity Admin Signup**: For celebrity managers/representatives who discover the platform independently
2. **Invited Team Member Signup**: For support agents who are invited to join a celebrity's team

## User Roles

### Administrator
- Full access to all features
- Can manage team members
- Can connect/disconnect social channels
- Can delete the celebrity profile
- Multiple administrators allowed per celebrity
- Can generate invite codes for support agents

### Support Agent
- Access to most features
- Cannot disconnect social channels
- Cannot delete celebrity profile
- Cannot manage team permissions
- Can handle day-to-day opportunity management

## Signup Flows

### 1. Direct Celebrity Admin Flow
1. **Landing Page**
   - Clear CTA for "Create Celebrity Account"
   - Option to "Join Existing Team" with invite code

2. **Onboarding Wizard for New Celebrity**
   - Step 0: Admin Profile
     - Admin's full name
     - Admin's email
     - Admin's role/relationship to celebrity
     - Profile photo (optional)
   
   - Step 1: Celebrity Information
     - Celebrity name
     - Social media handles
     - Profile photo (optional)
   
   - Step 2: Goals Setup
     - Add initial goals
     - Prioritize goals
     - Define success metrics
   
   - Step 3: Channel Connection
     - Connect Twitter/X account
     - Future: Additional channel options

   - Step 4: Opportunity Settings
     - Configure auto-classification preferences
     - Set relevance score thresholds
     - Define default tags

Note: Team setup and invite management is handled through the main application interface after initial onboarding is complete.

### 2. Invited Team Member Flow
1. **Landing Page**
   - Prominent "Enter Invite Code" field
   - Brief explanation of team member role

2. **Signup Process**
   - Enter invite code
   - Create account (email/password)
   - Accept team member agreement
   - Complete basic profile

## Technical Implementation Notes

### Database Schema Updates
```sql
-- Invite codes table
create table invite_codes (
  id uuid primary key default uuid_generate_v4(),
  celebrity_id uuid references celebrities(id) not null,
  code text unique not null,
  role text not null check (role in ('admin', 'support_agent')),
  created_by uuid references auth.users(id) not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

-- Index for quick invite code lookups
create index invite_codes_code_idx on invite_codes(code);
```

### Security Considerations
- Invite codes should be cryptographically secure
- Codes should expire after a set period (e.g., 7 days)
- Rate limiting on invite code attempts
- Audit logging for team member additions/role changes

### User Experience
- Clear distinction between admin and team member signup paths
- Helpful tooltips explaining role differences
- Progress indicators in onboarding wizard
- Ability to save progress and return later
- Email notifications for team invites

## Future Enhancements
- More granular role permissions
- Team member performance metrics
- Custom role creation
- Team collaboration features
- Bulk team member invites
- Team member training modules

## Next Steps
1. Implement invite code generation and validation
2. Create onboarding wizard UI components
3. Add role-based access control checks
4. Design and implement team management dashboard
5. Add audit logging for team actions 