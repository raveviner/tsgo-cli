import { createApp } from './app';
import { createLogger } from './middleware/logger';
import path from 'node:path';
import { readFileSync } from 'node:fs';
// [SWAGGWER IMPORT]
// [DOTENV IMPORT]

async function main() {
  const PORT = process.env.PORT || 3000;

  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  
  const appName = packageJson.name;
  const appVersion = packageJson.version;
  const logger = createLogger(`${appName} v${appVersion}`);
  const app = await createApp(logger);
  // [SWAGGER SETUP]

  app.listen(PORT, () => {
    console.log(`🚀 Service listening at http://localhost:${PORT}`);
    // [SWAGGER LOG]
  });
}

main().catch(async (err) => {
  try {
    console.error(`Webserver crashed: ${err.stack || err.toString()}`)
  } finally {
    process.exit(1)
  }
})
