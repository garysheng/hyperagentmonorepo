import { Metadata } from 'next';
import WritingStyleSettings from './writing-style-settings';

export const metadata: Metadata = {
  title: 'Writing Style Settings',
  description: 'Customize your AI writing style and voice characteristics',
};

export default function WritingStylePage() {
  return <WritingStyleSettings />;
} 