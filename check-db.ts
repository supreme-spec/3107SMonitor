import { prisma } from './db';

async function check() {
  try {
    await prisma.$connect();
    console.log('Connected to DB');

    const recognitionIncident = await prisma.recognitionIncident.findMany({ take: 5 });
    console.log('RecognitionIncident count:', recognitionIncident.length);

    const operator = await prisma.operator.findMany({ take: 5 });
    console.log('Operator count:', operator.length);

    const operatorVerdict = await prisma.operatorVerdict.findMany({ take: 5 });
    console.log('OperatorVerdict count:', operatorVerdict.length);

    const archiveTask = await prisma.archiveTask.findMany({ take: 5 });
    console.log('ArchiveTask count:', archiveTask.length);

    const archiveTaskStep = await prisma.archiveTaskStep.findMany({ take: 5 });
    console.log('ArchiveTaskStep count:', archiveTaskStep.length);

    const importSession = await prisma.importSession.findMany({ take: 5 });
    console.log('ImportSession count:', importSession.length);

    await prisma.$disconnect();
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

check();
