const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'Kilo' } }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { res(JSON.parse(d)); } catch(e) { res(null); }
      });
    }).on('error', rej);
  });
}

async function main() {
  // Get face-engine.ts from krakeninwork
  const r = await fetch('https://api.github.com/repos/supreme-spec/krakeninwork/contents/face-engine.ts?ref=main');
  if (!r) { console.log('No result'); return; }
  const remote = Buffer.from(r.content, 'base64').toString();
  const local = fs.readFileSync('face-engine.ts', 'utf8');

  // Find registerPerson function
  const lRe = /export async function registerPerson\(/;
  const rRe = /export async function registerPerson\(/;
  const li = local.search(lRe);
  const ri = remote.search(rRe);
  console.log('local registerPerson at:', li, 'remote at:', ri);

  if (li > 0 && ri > 0) {
    const lChunk = local.substring(li, li + 600);
    const rChunk = remote.substring(ri, ri + 600);
    console.log('=== LOCAL registerPerson ===');
    console.log(lChunk);
    console.log('=== REMOTE registerPerson ===');
    console.log(rChunk);
  }

  // Find enrollPhotoWithGate
  const l2 = local.indexOf('async function enrollPhotoWithGate');
  const r2 = remote.indexOf('async function enrollPhotoWithGate');
  console.log('\nlocal enrollPhotoWithGate at:', l2, 'remote at:', r2);

  if (l2 > 0 && r2 > 0) {
    console.log('=== LOCAL enrollPhotoWithGate ===');
    console.log(local.substring(l2, l2 + 600));
    console.log('=== REMOTE enrollPhotoWithGate ===');
    console.log(remote.substring(r2, r2 + 600));
  }

  // Find registerPersonFromDescriptor
  const l3 = local.indexOf('export async function registerPersonFromDescriptor');
  const r3 = remote.indexOf('export async function registerPersonFromDescriptor');
  console.log('\nlocal registerPersonFromDescriptor at:', l3, 'remote at:', r3);

  if (l3 > 0 && r3 > 0) {
    console.log('=== LOCAL registerPersonFromDescriptor ===');
    console.log(local.substring(l3, l3 + 800));
    console.log('=== REMOTE registerPersonFromDescriptor ===');
    console.log(remote.substring(r3, r3 + 800));
  }
}
main().catch(e => console.error(e));
