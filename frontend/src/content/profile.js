/**
 * Single source of truth for everything the site (and the AI assistant) says about Arnold.
 *
 * - Every component reads from this file; don't hardcode personal facts anywhere else.
 * - `npm run kb:export` turns it into the AI assistant's system prompt
 *   (backend/assistant/system-prompt.md). Re-run it and redeploy the backend after editing.
 * - Plain data only (no import.meta / browser APIs) so Node scripts can import it.
 * - `null` means "not provided yet": the UI and the knowledge base skip it.
 *   Lines marked `// TODO:` are listed by `npm run kb:export`.
 */

// Account was renamed from FitzFitzFitz69 in 2026; old profile links 404.
const GITHUB_USERNAME = 'FitzFitzFitzACJR'
const github = (repo) => `https://github.com/${GITHUB_USERNAME}/${repo}`

const profile = {
  name: 'Arnold Cutad Jr.',
  firstName: 'Arnold',
  // Main positioning line (hero, page title, meta description).
  title: 'Full-Stack Web Developer',
  // Alternatives considered for the hero headline; `headline` is the one in use.
  headlineOptions: [
    'IT Graduate · Full-Stack Web Developer',
    'Full-stack developer who builds it, ships it, and tests it',
    'Building reliable web apps with Angular, React & Node.js',
  ],
  headline: 'IT Graduate · Full-Stack Web Developer',
  status: 'IT graduate (University of Cebu – Main, June 2026)',
  availability: 'Open to entry-level full-stack and frontend developer roles.',
  location: 'Cebu, Philippines',
  email: 'cutadalamo@gmail.com',
  // Files in frontend/public. Avatar cropped from the original in the `pic` repo.
  avatar: {
    src: '/images/avatar-512.webp',
    srcSet: '/images/avatar-256.webp 256w, /images/avatar-512.webp 512w',
    width: 512,
    height: 512,
    alt: 'Portrait of Arnold Cutad Jr.',
  },
  // Generated from this file by `npm run resume:build` (no phone number or home address).
  resume: '/resume.pdf',
  siteUrl: null, // TODO: deployed portfolio URL (e.g. https://<your-site>.onrender.com)

  socials: {
    githubUsername: GITHUB_USERNAME,
    github: `https://github.com/${GITHUB_USERNAME}`,
    linkedin: 'https://www.linkedin.com/in/arnold-cutad-512b1642b/',
  },

  // Short and long bio. Keep claims backed by the experience/projects below.
  summary:
    'Arnold is an IT graduate and full-stack web developer who builds with Angular, React, Node.js, Express and PHP, with hands-on experience in REST API integration, database design, authentication, role-based access control and AI integration.',
  bio: [
    'I graduated with a Bachelor of Science in Information Technology from the University of Cebu – Main Campus in June 2026.',
    'During my internship at Elf Station Inc. I worked on the frontend of an Angular 19 building-permit portal: authentication, multi-step application forms, and role-based dashboards for permits, payments and inspections.',
    'For our capstone, WEBeenThere, I was the Project Manager and a frontend developer, leading planning and operations for an AI-powered website builder. I also build tools that make testing faster, like a QA launcher that automates logins.',
  ],

  // Skills grouped by category. No percentages; list what you've actually used.
  skills: [
    {
      category: 'Frontend',
      items: ['Angular', 'React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'PrimeNG'],
    },
    { category: 'Backend', items: ['Node.js', 'Express.js', 'PHP', 'REST APIs'] },
    { category: 'Databases', items: ['MySQL', 'PostgreSQL', 'Database design', 'CRUD'] },
    { category: 'Auth & Security', items: ['JWT', 'Authentication', 'Role-based access control'] },
    { category: 'AI Integration', items: ['Flowise AI', 'AI APIs', 'Streaming responses'] },
    { category: 'Tools & Deployment', items: ['Git', 'GitHub', 'Render', 'VS Code', 'Environment configuration'] },
    {
      category: 'QA & Process',
      items: [
        'Test planning',
        'Bug reporting',
        'Regression testing',
        'Test matrices',
        'Test automation tooling',
        'Project management',
        'Agile planning',
      ],
    },
  ],
  // Short list for compact spots (hero chips).
  featuredSkills: [
    'Angular',
    'React',
    'TypeScript',
    'Node.js',
    'Express.js',
    'PHP',
    'MySQL',
    'Tailwind CSS',
    'REST APIs',
    'JWT',
  ],

  experience: [
    {
      organization: 'Elf Station Inc.',
      role: 'Software Developer – Frontend',
      type: 'Internship',
      start: '2026-01',
      end: '2026-05',
      location: null, // TODO: city / remote (optional)
      summary: 'Frontend developer on an Angular 19 building-permit portal.',
      highlights: [
        'Developed an Angular 19 building-permit portal supporting new applications, renewals, amendments and ancillary permits.',
        'Implemented JWT authentication, route guards and HTTP interceptors for secure REST API access.',
        'Built a multi-step application wizard with reactive forms and local draft storage, so users can save and resume applications.',
        'Developed workflows for documents, payments, issued permits and inspection requests, along with role-based dashboards and navigation.',
      ],
      tech: ['Angular 19', 'TypeScript', 'REST APIs', 'JWT'],
    },
  ],

  education: [
    {
      school: 'University of Cebu – Main Campus',
      degree: 'Bachelor of Science in Information Technology',
      start: '2022',
      end: '2026-06',
      location: 'Cebu City',
      notes: ['Graduated June 2026.', 'Capstone: WEBeenThere (Project Manager).'],
    },
  ],

  certifications: [{ name: 'Introduction to Networks', issuer: 'Cisco', year: null /* TODO: year earned */ }],

  // Curated, in display order. `owner` other than GITHUB_USERNAME = team/external repo.
  featuredProjects: [
    {
      slug: 'webeenthere',
      name: 'WEBeenThere',
      badge: 'Project Manager · Capstone',
      role: 'Project Manager & Frontend Developer',
      team: true,
      teamSize: null, // TODO: number of team members
      repo: { owner: 'Kurisu21', name: 'webeenthere', url: 'https://github.com/Kurisu21/webeenthere' },
      liveUrl: null, // TODO: live demo or video URL
      image: null, // TODO: screenshot (Phase 4 adds images to frontend/public)
      description:
        'An AI-powered website builder that lets creators and local businesses generate, customize and publish professional websites.',
      problem:
        'Creators and local businesses need professional websites without hiring a developer or learning to code.',
      contribution: [
        'Led the project as Project Manager, spearheading planning and operations.',
        'Worked on the frontend (Next.js client).', // TODO: which screens/features you built (optional)
      ],
      built: [
        'Drag-and-drop canvas editor built on GrapesJS.',
        'AI-assisted template generation and canvas improvements (OpenRouter → DeepSeek), with AI output normalized to strict JSON (HTML, CSS, slots, metadata) the canvas can consume.',
        'User authentication and subscription plans, with usage limits enforced at the API layer before AI calls.',
        'Publish/export to plain HTML/CSS, with replaceable content via data-slot attributes.',
      ],
      tech: ['Next.js', 'Node.js', 'Express', 'MySQL', 'GrapesJS', 'OpenRouter', 'DeepSeek'],
      outcome: null, // TODO: results, grade/awards, what you learned as PM
    },
    {
      slug: 'qa-launcher',
      name: 'QA Launcher',
      badge: 'Test automation tool',
      role: 'Solo developer',
      team: false,
      repo: null, // Private repository (under NDA)
      private: true,
      liveUrl: null,
      image: null, // TODO: screenshot (optional, if allowed)
      description:
        'A launcher that automates logins, so QA testing starts in one click instead of repeated manual sign-ins.',
      problem: 'Signing in by hand again and again slows down manual QA testing.',
      contribution: ['Designed and built the tool.'],
      built: ['Automated login flow triggered from a single launcher.'], // TODO: more detail (optional)
      tech: ['JavaScript', 'HTML', 'CSS'],
      outcome: null, // TODO: impact (e.g. time saved), optional
    },
    {
      slug: 'portfolio-ai',
      name: 'Portfolio AI',
      badge: 'This site',
      role: 'Solo developer',
      team: false,
      repo: { owner: GITHUB_USERNAME, name: 'portfolio', url: github('portfolio') },
      liveUrl: null, // TODO: same as siteUrl once deployed
      image: null,
      description:
        "This portfolio site: React + Express with an AI assistant, powered by Claude, that answers visitors' questions about Arnold's experience and projects.",
      problem: null,
      contribution: ['Designed, built and deployed the frontend, backend and AI integration.'],
      built: [
        'Streaming AI assistant (Server-Sent Events) powered by Claude Haiku 4.5 through the Anthropic API, with short conversation memory.',
        'Hardened Express API: CORS allow-list, rate limiting, input validation and friendly error codes.',
        'Content kept in one profile file that also generates the assistant’s system prompt.',
      ],
      tech: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Claude API', 'Render'],
      outcome: null,
    },
    {
      slug: 'ccs-sit-in',
      name: 'CCS Sit-In Management System',
      badge: 'Academic project',
      role: 'Developer',
      team: false,
      repo: {
        owner: GITHUB_USERNAME,
        name: 'SysArch-SitInMonitoringSystem',
        url: github('SysArch-SitInMonitoringSystem'),
      },
      liveUrl: null,
      image: null,
      description: 'A PHP and MySQL laboratory monitoring system with session tracking, user management and reporting.',
      problem: null, // TODO: what problem it solved (optional)
      contribution: ['Developed the system.'],
      built: ['Sit-in session tracking.', 'User management.', 'Reporting features.'],
      tech: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'],
      outcome: null,
    },
  ],

  // GitHub feed ("More on GitHub"): the backend lists your public repos, minus forks, archived
  // repos, featured projects (shown above) and these hidden ones.
  hiddenRepos: ['pic'], // holds the original avatar photo, not a project
  // Repos owned by others that appear in featuredProjects; the backend fetches their public metadata.
  externalRepos: [{ owner: 'Kurisu21', name: 'webeenthere', label: 'Team project' }],

  assistant: {
    greeting: "Hi! I'm Arnold's AI assistant. Ask me about his projects, experience, skills, or how to get in touch.",
    suggestedQuestions: [
      'What projects has Arnold built?',
      'What was his capstone project?',
      'Where did Arnold intern?',
      'How can I contact Arnold?',
    ],
  },
}

export default profile
