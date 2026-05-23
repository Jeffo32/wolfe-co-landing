// Dev-only middleware. When the editor POSTs to /__save-preset, this:
//   1. Decodes each section's base64 payload back into a binary file
//   2. Writes it to /public/<preset-id>/<sectionId>.<ext>
//   3. Appends a new preset block to src/media/presets.js
// Vite's HMR then picks up the presets.js change and the new preset appears
// in the editor list without a manual refresh.
//
// In production builds (`vite build`) this plugin is skipped entirely.

import fs from 'node:fs/promises';
import path from 'node:path';

const PRESETS_PATH = 'src/media/presets.js';

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extFromMime(mime, fallbackExt) {
  if (fallbackExt) return fallbackExt;
  if (!mime) return '.bin';
  if (mime === 'video/mp4') return '.mp4';
  if (mime === 'video/webm') return '.webm';
  if (mime === 'video/quicktime') return '.mov';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  if (mime.startsWith('video/')) return '.mp4';
  if (mime.startsWith('image/')) return '.jpg';
  return '.bin';
}

export function presetsPlugin() {
  return {
    name: 'wolfe-presets-save',
    apply: 'serve', // dev only
    configureServer(server) {
      server.middlewares.use('/__save-preset', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = Buffer.concat(chunks).toString('utf-8');
          const { name, sections } = JSON.parse(body || '{}');

          if (!name || typeof name !== 'string') {
            res.statusCode = 400;
            return res.end('Missing preset name');
          }

          const presetId = slugify(name);
          if (!presetId) {
            res.statusCode = 400;
            return res.end('Invalid preset name');
          }

          const cwd = server.config.root;
          const presetDir = path.join(cwd, 'public', presetId);
          await fs.mkdir(presetDir, { recursive: true });

          const presetSections = {};
          for (const [sectionId, s] of Object.entries(sections || {})) {
            if (!s) continue;
            if (s.dataBase64) {
              const buf = Buffer.from(s.dataBase64, 'base64');
              const fromName = s.filename ? path.extname(s.filename) : '';
              const ext = extFromMime(s.mimeType, fromName);
              const filename = `${sectionId}${ext}`;
              await fs.writeFile(path.join(presetDir, filename), buf);
              presetSections[sectionId] = {
                type: s.type,
                url: `/${presetId}/${filename}`,
              };
            } else if (s.url) {
              presetSections[sectionId] = { type: s.type, url: s.url };
            }
          }

          if (Object.keys(presetSections).length === 0) {
            res.statusCode = 400;
            return res.end('No sections to save');
          }

          // Append to src/media/presets.js
          const presetsPath = path.join(cwd, PRESETS_PATH);
          let content = await fs.readFile(presetsPath, 'utf-8');

          const sectionsLines = Object.entries(presetSections)
            .map(([id, sec]) =>
              `      ${id}: { type: ${JSON.stringify(sec.type)}, url: ${JSON.stringify(sec.url)} },`,
            )
            .join('\n');

          const newBlock =
            `  {\n` +
            `    id: ${JSON.stringify(presetId)},\n` +
            `    name: ${JSON.stringify(name)},\n` +
            `    sections: {\n${sectionsLines}\n    },\n` +
            `  },\n`;

          // Insert before the closing `];` of the PRESETS array
          if (!/\];\s*$/m.test(content)) {
            // Defensive: file shape is unexpected
            res.statusCode = 500;
            return res.end('Could not locate end of PRESETS array in presets.js');
          }
          const updated = content.replace(/(\];\s*)$/m, `${newBlock}$1`);
          await fs.writeFile(presetsPath, updated);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, id: presetId, name }));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[wolfe-presets-save]', e);
          res.statusCode = 500;
          res.end(String(e?.message || e));
        }
      });
    },
  };
}
