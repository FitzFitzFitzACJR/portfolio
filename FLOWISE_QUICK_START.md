# Flowise Quick Start Guide

## Quick Setup Steps

### 1. Create Your Chatflow

1. Go to [Flowise Cloud](https://cloud.flowise.ai) or your self-hosted Flowise instance
2. Click "Create New Chatflow"
3. Name it "Portfolio Assistant" or similar

### 2. Add Nodes

**Minimum Setup:**
- Add a **Chat Model** node (e.g., OpenAI GPT-3.5/4, Anthropic Claude, etc.)
- Connect it to the output

**Recommended Setup:**
- Add a **Chat Model** node
- Add a **Memory** node (for conversation history)
- Connect: Start → Chat Model → Memory → Output

### 3. Configure the Chat Model

1. Click on the **Chat Model** node
2. Select your preferred model (OpenAI, Anthropic, etc.)
3. Add your API key for the model
4. In the **System Message** field, paste the prompt from `FLOWISE_PROMPT_TEMPLATE.md`
5. Update the GitHub URL placeholder in the prompt

### 4. Configure Settings

- **Temperature**: 0.7-0.9 (for conversational responses)
- **Max Tokens**: 500-1000 (adjust based on needs)
- **Memory**: Enable if using Memory node

### 5. Test Your Chatflow

Click "Test" in Flowise and try:
- "What technologies does Arnold use?"
- "Tell me about Arnold's projects"
- "How can I contact Arnold?"

### 6. Deploy and Get URL

1. Click "Deploy" or "Save"
2. Copy the **Chatflow ID** or full **API URL**
3. Add to your backend `.env` file:

```env
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_api_key_if_required
```

### 7. Test in Your Portfolio

1. Start your backend: `npm run dev`
2. Open your portfolio website
3. Click the chatbot icon
4. Test the conversation!

## Example Chatflow Structure

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌──────────────┐
│  Chat Model  │ ← Add system prompt here
│  (OpenAI)    │
└────┬─────────┘
     │
     ▼
┌──────────┐
│  Memory  │ ← Optional: for conversation history
└────┬─────┘
     │
     ▼
┌──────────┐
│  Output  │
└──────────┘
```

## Common Models to Use

- **OpenAI**: GPT-3.5-turbo, GPT-4
- **Anthropic**: Claude 3 (Sonnet, Opus, Haiku)
- **Google**: Gemini Pro
- **Open Source**: Llama 2, Mistral (if self-hosted)

## Tips

- Start simple with just a Chat Model node
- Add Memory later for better conversations
- Test thoroughly before deploying
- Keep the system prompt focused and clear
- Update the prompt with your actual GitHub URL

## Need Help?

Refer to `FLOWISE_PROMPT_TEMPLATE.md` for the complete prompt template and advanced configuration options.


