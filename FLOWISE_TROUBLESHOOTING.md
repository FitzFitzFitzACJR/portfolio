# Flowise Troubleshooting Guide

## Issue: Getting HTML Instead of Chatbot Response

If you're seeing HTML content (like the Flowise UI page) instead of chatbot responses, this means the API is hitting the wrong endpoint.

### Common Causes:

1. **Wrong API URL Format**
   - ❌ Wrong: `https://cloud.flowise.ai` (base URL)
   - ❌ Wrong: `https://cloud.flowise.ai/your-chatflow-id` (missing API path)
   - ✅ Correct: `https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id`

2. **Using Chatflow Share URL Instead of API URL**
   - The share URL is for embedding in websites, not for API calls
   - You need the API endpoint URL

3. **Chatflow Not Deployed**
   - Make sure your chatflow is saved and deployed in Flowise
   - Undeployed chatflows won't respond to API calls

## How to Fix

### Step 1: Get the Correct API URL

**For Flowise Cloud:**

1. Go to [cloud.flowise.ai](https://cloud.flowise.ai)
2. Open your chatflow
3. Click on the **"API"** tab or **"Deploy"** button
4. Look for the **API URL** or **Prediction Endpoint**
5. It should look like: `https://cloud.flowise.ai/api/v1/prediction/abc123xyz`

**For Self-Hosted Flowise:**

1. Your API URL format: `http://your-flowise-instance/api/v1/prediction/your-chatflow-id`
2. Replace `your-flowise-instance` with your actual Flowise server URL
3. Replace `your-chatflow-id` with your actual chatflow ID

### Step 2: Update Your .env File

```env
# Option 1: Full API URL (Recommended)
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-actual-chatflow-id

# Option 2: Using Chatflow ID
FLOWISE_CHATFLOW_ID=your-actual-chatflow-id
FLOWISE_BASE_URL=https://cloud.flowise.ai
```

### Step 3: Verify the URL

Test your API URL directly using curl or Postman:

```bash
curl -X POST https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello"}'
```

**Expected Response (JSON):**
```json
{
  "text": "Hello! How can I help you?"
}
```

**Wrong Response (HTML):**
```html
<!DOCTYPE html>
<html>...
```

If you get HTML, the URL is wrong.

## Common URL Mistakes

### ❌ Wrong Examples:

```
https://cloud.flowise.ai
https://cloud.flowise.ai/chatflow/abc123
https://flowise.ai/api/v1/prediction/abc123
http://localhost:3000 (if not your self-hosted instance)
```

### ✅ Correct Examples:

```
https://cloud.flowise.ai/api/v1/prediction/abc123xyz
http://localhost:3000/api/v1/prediction/abc123xyz (self-hosted)
https://your-flowise-instance.com/api/v1/prediction/abc123xyz
```

## Finding Your Chatflow ID

### In Flowise Cloud:

1. Open your chatflow
2. Look at the URL in your browser
3. The chatflow ID is usually in the URL or in the API section
4. Or check the "Deploy" or "API" tab

### In Self-Hosted Flowise:

1. Check the chatflow URL: `http://your-instance/chatflow/your-chatflow-id`
2. The ID is the last part of the URL
3. Or check the API documentation in your Flowise instance

## Testing Your Configuration

After updating your `.env` file:

1. Restart your backend server:
   ```bash
   npm run dev
   ```

2. Check the backend logs for any errors

3. Test the chatbot in your portfolio

4. If you still get HTML, check:
   - The exact URL in your `.env` file
   - That the chatflow is deployed
   - That you're using the `/api/v1/prediction/` endpoint

## Additional Checks

### Check Your Backend Logs

Look for error messages like:
- "Flowise returned HTML instead of JSON"
- "Chatflow not found (404)"
- "Cannot connect to Flowise API"

These will tell you exactly what's wrong.

### Verify API Key (if required)

Some Flowise instances require an API key:

```env
FLOWISE_API_KEY=your_api_key_here
```

Check your Flowise settings to see if authentication is enabled.

## Still Having Issues?

1. **Double-check the URL format** - Must include `/api/v1/prediction/`
2. **Verify chatflow is deployed** - Undeployed chatflows won't work
3. **Test the URL directly** - Use curl/Postman to verify it returns JSON
4. **Check Flowise documentation** - For your specific Flowise version
5. **Check backend logs** - They now include detailed error messages

## Quick Checklist

- [ ] API URL includes `/api/v1/prediction/`
- [ ] Chatflow ID is correct
- [ ] Chatflow is deployed in Flowise
- [ ] `.env` file has correct `FLOWISE_API_URL`
- [ ] Backend server restarted after `.env` changes
- [ ] API URL tested directly (returns JSON, not HTML)


