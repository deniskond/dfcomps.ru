import * as https from 'https';
import * as fs from 'fs';

const DISCORD_MAX_LENGTH = 2000;

// Discord webhooks reject messages longer than 2000 chars; split at line boundaries to avoid cutting mid-sentence.
function splitIntoChunks(content: string): string[] {
  if (content.length <= DISCORD_MAX_LENGTH) {
    return [content];
  }

  const chunks: string[] = [];
  const lines = content.split('\n');
  let current = '';

  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;

    if (candidate.length > DISCORD_MAX_LENGTH) {
      if (current) {
        chunks.push(current);
      }
      current = line;
    } else {
      current = candidate;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function sendWebhookMessage(webhookUrl: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ content });
    const url = new URL(webhookUrl);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      res.resume();
      res.on('end', () => {
        if (res.statusCode === 204 || res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Discord webhook returned HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

(async () => {
  const webhookUrl = process.env.DISCORD_RELEASE_HOOK;

  if (!webhookUrl) {
    console.error('Error: DISCORD_RELEASE_HOOK environment variable is not set.');
    process.exit(1);
  }

  const filePath = process.argv[2];
  let releaseNotes: string;

  if (filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    releaseNotes = fs.readFileSync(filePath, 'utf8').trim();
  } else {
    releaseNotes = await readStdin();
  }

  if (!releaseNotes) {
    console.error('Error: No release notes provided (empty input).');
    process.exit(1);
  }

  const chunks = splitIntoChunks(releaseNotes);

  for (const chunk of chunks) {
    await sendWebhookMessage(webhookUrl, chunk);
  }

  console.log(`Release notes posted to Discord (${chunks.length} message(s)).`);
})().catch((err: Error) => {
  console.error('Failed to post to Discord:', err.message);
  process.exit(1);
});
