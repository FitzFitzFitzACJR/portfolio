# Flowise Knowledge Base Setup Guide

This guide explains how to use the `FLOWISE_KNOWLEDGE_BASE.md` document in your Flowise chatflow to provide better context to your portfolio chatbot.

## What is a Knowledge Base?

A knowledge base in Flowise allows you to provide context documents that the AI can reference when answering questions. This makes the chatbot more accurate and informed about specific topics (in this case, your portfolio information).

## Setup Methods

### Method 1: Document Loader Node (Recommended)

1. **Open your Flowise chatflow**
2. **Add a Document Loader node:**
   - Search for "Document Loader" or "File Loader" in the node palette
   - Drag it into your flow

3. **Configure the Document Loader:**
   - **File Type:** Select "Markdown" or "Text"
   - **Upload File:** Upload `FLOWISE_KNOWLEDGE_BASE.md`
   - Or paste the content directly if supported

4. **Connect to your Chat Model:**
   - Connect the Document Loader output to your Chat Model node
   - The document will be processed and made available to the AI

### Method 2: Vector Store (Advanced)

1. **Add a Vector Store node:**
   - Search for "Vector Store" or "Embeddings" in Flowise
   - This creates a searchable knowledge base

2. **Add Document Loader:**
   - Connect a Document Loader to the Vector Store
   - Upload or paste the knowledge base content

3. **Add Retrieval:**
   - Add a "Retrieval" or "Retrieval QA" node
   - Connect Vector Store → Retrieval → Chat Model

4. **Configure:**
   - Set up embeddings (OpenAI, Cohere, etc.)
   - Configure similarity search settings

### Method 3: System Prompt Enhancement

1. **Copy key sections** from `FLOWISE_KNOWLEDGE_BASE.md`
2. **Add to your Chat Model's system prompt:**
   - Open your Chat Model node
   - In the system message field, add relevant sections
   - Focus on FAQs and key information

## Recommended Flow Structure

### Simple Setup (Method 1):
```
[Start] 
  → [Document Loader] (loads FLOWISE_KNOWLEDGE_BASE.md)
  → [Chat Model] (with system prompt)
  → [Memory] (optional)
  → [Output]
```

### Advanced Setup (Method 2):
```
[Start]
  → [Document Loader] (loads knowledge base)
  → [Vector Store] (embeddings)
  → [Retrieval QA] (searches knowledge base)
  → [Chat Model]
  → [Memory]
  → [Output]
```

## Configuration Tips

### Document Loader Settings:
- **Chunk Size:** 1000-2000 characters (for better context)
- **Chunk Overlap:** 200-500 characters (for context continuity)
- **File Format:** Markdown or Text

### Vector Store Settings:
- **Embedding Model:** Use OpenAI, Cohere, or other supported models
- **Similarity Threshold:** 0.7-0.8 (adjust based on results)
- **Top K Results:** 3-5 (number of relevant chunks to retrieve)

### Chat Model Settings:
- **Temperature:** 0.7-0.9 (for conversational responses)
- **Max Tokens:** 500-1000 (adjust based on response length needed)
- **System Prompt:** Include basic instructions about being a portfolio assistant

## Testing Your Knowledge Base

After setup, test with these questions:

1. "What technologies does Arnold know?"
2. "Tell me about Arnold's projects"
3. "How can I contact Arnold?"
4. "What is Arnold's educational background?"
5. "What projects has Arnold worked on?"
6. "Where can I see Arnold's code?"

The chatbot should now provide accurate, detailed answers based on the knowledge base.

## Updating the Knowledge Base

When you need to update information:

1. **Edit** `FLOWISE_KNOWLEDGE_BASE.md`
2. **Re-upload** to Flowise (if using Document Loader)
3. **Or update** the Vector Store (if using that method)
4. **Test** with sample questions

## Troubleshooting

### Chatbot not using knowledge base:
- Check that Document Loader/Vector Store is connected properly
- Verify the document was loaded successfully
- Check retrieval settings (if using Vector Store)
- Ensure system prompt references the knowledge base

### Inaccurate responses:
- Increase chunk size for better context
- Adjust similarity threshold in Vector Store
- Add more specific information to the knowledge base
- Review and refine the FAQs section

### Slow responses:
- Reduce chunk size
- Lower Top K results in retrieval
- Use faster embedding models
- Optimize document structure

## Best Practices

1. **Keep it updated:** Regularly update the knowledge base with new projects and information
2. **Be specific:** Include detailed information in FAQs
3. **Organize well:** Use clear sections and headings in the markdown
4. **Test regularly:** Test the chatbot after any knowledge base updates
5. **Monitor performance:** Check if responses are accurate and helpful

## Alternative: Embed in System Prompt

If you prefer not to use Document Loader, you can:

1. Copy the FAQ section from `FLOWISE_KNOWLEDGE_BASE.md`
2. Add it to your Chat Model's system prompt
3. Update the system prompt when information changes

This is simpler but less flexible than using a knowledge base.

---

**Note:** The knowledge base works best with Vector Store + Retrieval setup, but the Document Loader method is simpler and works well for smaller knowledge bases like this portfolio FAQ.

