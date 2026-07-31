import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const result = await prisma.$queryRaw`
  SELECT p.id, p.name, p.embedding_count, COUNT(fd.id) as descriptor_count
  FROM Person p
  LEFT JOIN FaceDescriptor fd ON fd.person_id = p.id
  GROUP BY p.id, p.name, p.embedding_count
  ORDER BY p.id
`;

console.log(JSON.stringify(result, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2));
await prisma.$disconnect();
