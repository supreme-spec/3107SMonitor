const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new Database(dbPath, { readonly: true });

try {
  console.log('Checking FaceDescriptor table...');
  
  const count = db.prepare('SELECT COUNT(*) as count FROM FaceDescriptor').get();
  console.log('Total FaceDescriptor records:', count.count);
  
  if (count.count > 0) {
    const samples = db.prepare('SELECT id, person_id, photo_path, LENGTH(descriptor) as descriptor_length, descriptor FROM FaceDescriptor LIMIT 5').all();
    console.log('\nSample records:');
    samples.forEach(row => {
      console.log('ID:', row.id, 'Person ID:', row.person_id, 'Photo:', row.photo_path);
      console.log('  Descriptor length:', row.descriptor_length, 'chars');
      console.log('  Descriptor preview:', row.descriptor.substring(0, 100) + '...');
      console.log('  Descriptor starts with [', row.descriptor.startsWith('['));
    });
  }
  
  const personCount = db.prepare('SELECT COUNT(*) as count FROM Person').get();
  console.log('\nTotal Person records:', personCount.count);
  
  const personsWithEmbeddings = db.prepare('SELECT COUNT(*) as count FROM Person WHERE embedding_count > 0').get();
  console.log('Persons with embedding_count > 0:', personsWithEmbeddings.count);
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  db.close();
}