import 'dotenv/config';
import { createApp } from './app.js';
import { describeFlowiseConfig } from './config/flowise.js';

const PORT = process.env.PORT || 5000;
const { app, config } = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  for (const warning of config.warnings ?? []) console.warn(`Chatbot warning: ${warning}`);
  console.log(describeFlowiseConfig(config));
});
