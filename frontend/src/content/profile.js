// Single source of truth for personal content. Phase 2 expands this file
// (bio, skills, timeline, projects) and generates the Flowise knowledge base from it.

const profile = {
  name: 'Arnold Cutad Jr.',
  firstName: 'Arnold',
  email: 'cutadalamo@gmail.com',
  socials: {
    github: import.meta.env.VITE_GITHUB_PROFILE_URL || 'https://github.com/FitzFitzFitz69',
    linkedin: 'https://www.linkedin.com/in/arnold-cutad-512b1642b/',
  },
  assistant: {
    greeting:
      "Hi! I'm Arnold's AI assistant. Ask me about his projects, experience, skills, or how to get in touch.",
    suggestedQuestions: [
      'What projects has Arnold built?',
      'What was his capstone project?',
      'Where did Arnold intern?',
      'How can I contact Arnold?',
    ],
  },
};

export default profile;
