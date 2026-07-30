const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'Kilo' } }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(e) { res(null); } });
    }).on('error', rej);
  });
}

async function main() {
  const r = await fetch('https://api.github.com/repos/supreme-spec/krakeninwork/contents/face-engine.ts?ref=main');
  if (!r) { console.log('No result'); return; }
  const remote = Buffer.from(r.content, 'base64').toString();
  const local = fs.readFileSync('face-engine.ts', 'utf8');

  // Find registerPersonFromDescriptor - show more context
  const l3 = local.indexOf('export async function registerPersonFromDescriptor');
  const r3 = remote.indexOf('export async function registerPersonFromDescriptor');
  if (l3 > 0 && r3 > 0) {
    console.log('=== LOCAL registerPersonFromDescriptor (extended) ===');
    console.log(local.substring(l3, l3 + 2000));
    console.log('=== REMOTE registerPersonFromDescriptor (extended) ===');
    console.log(remote.substring(r3, r3 + 2000));
  }

  // Find addEmbeddingToPerson
  const l4 = local.indexOf('export async function addEmbeddingToPerson');
  const r4 = remote.indexOf('export async function addEmbeddingToPerson');
  console.log('\nlocal addEmbeddingToPerson at:', l4, 'remote at:', r4);
  if (l4 > 0 && r4 > 0) {
    console.log('=== LOCAL addEmbeddingToPerson ===');
    console.log(local.substring(l4, l4 + 800));
    console.log('=== REMOTE addEmbeddingToPerson ===');
    console.log(remote.substring(r4, r4 + 800));
  }

  // Find saveDescriptorToDB
  const l5 = local.indexOf('async function saveDescriptorToDB');
  const r5 = remote.indexOf('async function saveDescriptorToDB');
  console.log('\nlocal saveDescriptorToDB at:', l5, 'remote at:', r5);
  if (l5 > 0 && r5 > 0) {
    console.log('=== LOCAL saveDescriptorToDB ===');
    console.log(local.substring(l5, l5 + 800));
    console.log('=== REMOTE saveDescriptorToDB ===');
    console.log(remote.substring(r5, r5 + 800));
  }
}
main().catch(e => console.error(e));
