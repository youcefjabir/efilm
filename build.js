#!/usr/bin/env node
/* Bygger en självständig enfils-HTML av src/ (för preview/artifact) samt
   en dev-index som laddar modulerna var för sig. */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

const ORDER = [
  '00-utils.js', '10-model.js', '12-motion-model.js', '20-store.js', '30-persist.js',
  '40-media.js', '44-image-analyze.js', '45-music-make.js', '46-music-structure.js', '48-director.js',
  '49-generation.js', '50-stab-analyze.js', '55-stab-process.js', '60-color.js',
  '70-render.js', '75-playback.js', '80-timeline.js', '85-panels.js',
  '87-motion-ui.js', '90-export.js', '95-app.js',
];

const TITLE = 'Master Bostadsfilm';

function build() {
  const css = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');
  const shell = fs.readFileSync(path.join(SRC, 'shell.html'), 'utf8');
  const js = ORDER.map(f => `/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n\n');

  fs.mkdirSync(DIST, { recursive: true });
  const single = `<title>${TITLE}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
${css}
</style>
${shell}
<script>
${js}
</script>
`;
  fs.writeFileSync(path.join(DIST, 'index.html'), single);

  const dev = `<title>${TITLE} — dev</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="src/style.css">
${shell}
${ORDER.map(f => `<script src="src/${f}"></script>`).join('\n')}
`;
  fs.writeFileSync(path.join(__dirname, 'index.html'), dev);

  const kb = (fs.statSync(path.join(DIST, 'index.html')).size / 1024).toFixed(0);
  console.log(`dist/index.html  ${kb} KB   (${ORDER.length} moduler)`);
}
build();
