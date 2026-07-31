import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import { getEmbedding } from "./face-engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function regenerateEmbeddings() {
  console.log("Начало перегенерации эмбеддингов...");

  // Получаем всех персон с фото
  const personsWithPhotos = await prisma.person.findMany({
    where: {
      photos: {
        some: {
          is_primary: true,
        },
      },
    },
    include: {
      photos: {
        where: {
          is_primary: true,
        },
        take: 1,
      },
    },
  });

  console.log(`Найдено персон с фото: ${personsWithPhotos.length}`);

  let successCount = 0;
  let failCount = 0;

  for (const person of personsWithPhotos) {
    const photo = person.photos[0];
    if (!photo) continue;

    const photoPath = photo.photo_path;
    const fullPath = path.join(__dirname, "public", photoPath);

    try {
      const result = await getEmbedding(fullPath);
      if (result && result.descriptor) {
        // Сохраняем эмбеддинг в БД через face-engine
        await prisma.$transaction([
          prisma.faceDescriptor.create({
            data: {
              person_id: person.id,
              photo_path: photoPath,
              descriptor: Buffer.from(result.descriptor.buffer),
            },
          }),
          prisma.person.update({
            where: { id: person.id },
            data: { embedding_count: 1 },
          }),
        ]);

        console.log(`✓ ${person.name} (ID: ${person.id}): эмбеддинг сохранён`);
        successCount++;
      } else {
        console.log(`✗ ${person.name} (ID: ${person.id}): не удалось извлечь эмбеддинг`);
        failCount++;
      }
    } catch (err) {
      console.log(`✗ ${person.name} (ID: ${person.id}): ошибка - ${(err as Error).message}`);
      failCount++;
    }
  }

  console.log(`\nИтого: ${successCount} успешно, ${failCount} ошибок`);
  await prisma.$disconnect();
}

regenerateEmbeddings().catch(console.error);
