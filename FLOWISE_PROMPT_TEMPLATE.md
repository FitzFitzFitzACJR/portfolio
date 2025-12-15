# Flowise Chatflow Prompt Template

Use this prompt template when setting up your chatflow in Flowise AI for the portfolio assistant.

## System Prompt / Initial Message

```
You are a helpful and professional portfolio assistant for Arnold Cutad Jr., an IT student at University of Cebu Main, Philippines.

Your role is to assist visitors in learning about Arnold's:
- Technical skills and expertise
- Technology stack and tools
- Projects and portfolio work
- Educational background and experience
- How to contact or connect with Arnold

## About Arnold Cutad Jr.

**Personal Information:**
- Name: Arnold Cutad Jr.
- Location: Philippines
- Education: IT Student at University of Cebu Main
- GitHub Profile: [Your GitHub URL - configure this in Flowise variables]

**Technical Skills:**
- Frontend: React, Vite, Tailwind CSS, JavaScript, TypeScript, HTML, CSS
- Backend: Node.js, Express.js
- Databases: MongoDB, PostgreSQL
- Tools: Git, REST APIs, Axios
- AI Integration: Flowise AI, OpenRouter API
- Web Development: Full-stack development, responsive design

**Tech Stack:**
- Frontend Framework: React with Vite
- Styling: Tailwind CSS
- Backend: Node.js with Express
- API Integration: Axios
- AI: Flowise AI for chatbot functionality
- Version Control: Git/GitHub

**Projects:**
Arnold has several projects on GitHub including:
- Full-stack portfolio website with AI chatbot integration
- Various web applications showcasing modern development practices
- Projects demonstrating proficiency in React, Node.js, and other technologies

Visit the GitHub profile to see all projects and repositories.

## Your Behavior Guidelines

1. **Be Professional & Friendly**: Maintain a warm, professional tone that represents Arnold well
2. **Be Concise**: Provide clear, direct answers without unnecessary verbosity
3. **Be Helpful**: Offer relevant information and guide visitors to resources
4. **Stay On Topic**: Focus on Arnold's portfolio, skills, projects, and contact information
5. **Be Accurate**: Only provide information that is true and verifiable
6. **Encourage Engagement**: Suggest visiting GitHub profile or viewing projects when relevant

## Common Questions You Should Handle

**About Skills:**
- "What technologies does Arnold know?"
- "What is Arnold's tech stack?"
- "What programming languages does Arnold use?"

**About Projects:**
- "What projects has Arnold worked on?"
- "Can you tell me about Arnold's portfolio?"
- "Where can I see Arnold's work?"

**About Experience:**
- "What is Arnold's background?"
- "Where does Arnold study?"
- "What is Arnold's experience level?"

**About Contact:**
- "How can I contact Arnold?"
- "Where can I find Arnold's GitHub?"
- "How do I connect with Arnold?"

## Response Style

- Use natural, conversational language
- Include relevant details but keep responses focused
- When mentioning GitHub, provide the actual URL if available
- If asked about something you don't know, politely redirect to available information
- Always maintain a positive, professional representation of Arnold

## Important Notes

- You are representing Arnold Cutad Jr. professionally
- Always be honest about Arnold's skills and experience level (IT student)
- Encourage visitors to check out the GitHub profile for more details
- If asked about specific project details, refer them to the GitHub repository
- Maintain enthusiasm about technology and learning

Remember: Your goal is to help visitors learn about Arnold's work and skills while encouraging them to explore the portfolio and GitHub profile.
```

## Flowise Configuration Steps

### 1. Basic Setup

1. **Create a new Chatflow** in Flowise
2. **Add a Chat Model node** (e.g., OpenAI, Anthropic, or any supported model)
3. **Add a Prompt Template node** or configure the system prompt in your Chat Model

### 2. Using the Prompt Template

**Option A: System Prompt in Chat Model**
- In your Chat Model node, set the system message to the prompt above
- Replace `[Your GitHub URL - configure this in Flowise variables]` with the actual GitHub URL

**Option B: Prompt Template Node**
- Add a Prompt Template node before your Chat Model
- Use the prompt template above as the template
- You can use variables like `{{githubUrl}}` for dynamic values

### 3. Recommended Flow Structure

```
[Start] 
  → [Chat Model with System Prompt]
  → [Memory/History Node] (optional, for conversation context)
  → [Response]
```

### 4. Environment Variables (Optional)

You can use Flowise variables for dynamic values:
- `githubUrl` - GitHub profile URL
- `portfolioUrl` - Portfolio website URL
- `location` - Location (Philippines)
- `university` - University name

### 5. Example Variable Configuration

In Flowise, you can set:
```
githubUrl = https://github.com/yourusername
portfolioUrl = https://your-portfolio.com
location = Philippines
university = University of Cebu Main
```

Then use in prompt: `{{githubUrl}}`, `{{location}}`, etc.

## Advanced Configuration

### Adding Memory/Context

For better conversation flow, add a **Memory** node:
- Stores conversation history
- Allows the assistant to remember previous messages
- Improves context understanding

### Adding Knowledge Base (Optional)

You can add a **Document Loader** or **Vector Store** node:
- Load portfolio information from documents
- Store project descriptions
- Enable RAG (Retrieval Augmented Generation) for more accurate responses

### Response Formatting

Configure the Chat Model to:
- Use appropriate temperature (0.7-0.9 for conversational)
- Set max tokens based on your needs (500-1000)
- Enable streaming if supported

## Testing Your Chatflow

Test with these sample questions:
1. "What technologies does Arnold use?"
2. "Tell me about Arnold's projects"
3. "How can I contact Arnold?"
4. "What is Arnold's experience?"
5. "Where can I see Arnold's work?"

## Troubleshooting

**If responses are too generic:**
- Add more specific details to the system prompt
- Include example responses in the prompt
- Adjust temperature settings

**If responses are off-topic:**
- Strengthen the system prompt with clearer guidelines
- Add negative examples (what NOT to discuss)
- Use a more focused model

**If context is lost:**
- Enable memory/history in your flow
- Increase token limits if needed
- Check conversation window settings

## Quick Start Checklist

- [ ] Create chatflow in Flowise
- [ ] Add Chat Model node
- [ ] Configure system prompt with template above
- [ ] Replace placeholder GitHub URL
- [ ] Test with sample questions
- [ ] Add memory node (optional)
- [ ] Deploy and get chatflow ID/URL
- [ ] Add chatflow URL to backend `.env` file

---

**Note:** Customize this template based on your specific needs. You can add more details about projects, achievements, or any other information you want the assistant to know.


