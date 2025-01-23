# Writing Style Settings

## Overview
The Writing Style Settings page allows celebrity teams to customize and fine-tune the AI's writing style to match the celebrity's authentic voice. These settings influence how the AI generates responses across all communication channels (email, Twitter DMs, etc.).

## Key Features

### 1. Voice Characteristics
- **Tone Settings**
  - Formality slider (Very Casual ↔ Very Formal)
  - Enthusiasm level (Reserved ↔ Enthusiastic)
  - Directness (Diplomatic ↔ Direct)
  - Humor level (Serious ↔ Playful)

- **Writing Style**
  - Sentence length preference (Concise ↔ Elaborate)
  - Vocabulary complexity (Simple ↔ Sophisticated)
  - Technical language usage (Avoid ↔ Embrace)
  - Emoji usage (Never ↔ Frequent)

### 2. Voice Examples
- Input field for sample messages that represent the celebrity's authentic voice
- Ability to add multiple examples for different contexts:
  - Professional communications
  - Fan interactions
  - Business inquiries
  - Casual conversations

### 3. Custom Rules
- Add specific phrases or expressions the celebrity commonly uses
- Define words or phrases to avoid
- Set custom greeting and sign-off preferences
- Special handling for specific topics or situations

### 4. Preview & Testing
- Real-time preview of generated responses with current settings
- A/B testing different style configurations
- Ability to save and compare different style presets

## Database Schema

```typescript
interface WritingStyle {
  id: string;
  celebrity_id: string;
  
  // Tone Settings (0-100 scale)
  formality_level: number;
  enthusiasm_level: number;
  directness_level: number;
  humor_level: number;
  
  // Writing Style Settings (0-100 scale)
  sentence_length_preference: number;
  vocabulary_complexity: number;
  technical_language_level: number;
  emoji_usage_level: number;
  
  // Custom Rules
  preferred_phrases: string[];
  avoided_phrases: string[];
  preferred_greetings: string[];
  preferred_signoffs: string[];
  
  // Voice Examples
  voice_examples: Array<{
    context: 'professional' | 'fan' | 'business' | 'casual';
    content: string;
  }>;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_updated_by: string;
}
```

## UI/UX Design

### Layout
1. **Top Section**
   - Current style summary
   - Last updated info
   - Save/Reset buttons

2. **Main Settings Area (Tabs)**
   - Voice Characteristics
   - Writing Examples
   - Custom Rules
   - Preview & Testing

3. **Preview Panel**
   - Fixed position on the right
   - Shows real-time generated examples
   - Compare different settings

### Interactive Elements
- Sliders for numerical settings
- Rich text editor for examples
- Tag input for phrases
- Before/After preview comparisons
- Undo/Redo functionality

## Implementation Details

### 1. AI Integration
- Settings are converted into system prompts
- Each setting influences specific aspects of the prompt
- Real-time adjustments based on slider changes
- A/B testing capabilities

### 2. Storage & Caching
- Settings cached locally for quick access
- Periodic auto-save
- Version history of changes
- Export/Import functionality

### 3. Validation & Safety
- Prevent extreme or inappropriate settings
- Content moderation for examples
- Backup of previous settings
- Confirmation for major changes

## Future Enhancements
1. ML-based style analysis of existing messages
2. Style templates for different contexts
3. Advanced A/B testing tools
4. Voice style analytics
5. Integration with third-party style guides

## Technical Requirements
- Next.js 15+ for the frontend
- Supabase for data storage
- ShadcN UI components
- Deepseek API for response generation
- Real-time preview capabilities
- Responsive design for all screen sizes

## Success Metrics
1. Response accuracy to style settings
2. Team satisfaction with customization
3. Reduction in manual message editing
4. Consistency across channels
5. Time saved in communication 