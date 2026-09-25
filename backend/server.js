import 'dotenv/config';
import { createApp } from './app.js';
import { describeAssistantConfig } from './config/assistant.js';

const PORT = process.env.PORT || 5000;
const { app, config } = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(describeAssistantConfig(config));
});
