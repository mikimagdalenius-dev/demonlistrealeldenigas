import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const initialDemons = [
    {
      position: 1,
      name: "Acheron",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      publisherName: "Zoink",
      difficulty: 10
    },
    {
      position: 2,
      name: "Tidal Wave",
      videoUrl: "https://www.youtube.com/watch?v=example2",
      publisherName: "OniLink",
      difficulty: 9
    }
  ];

  for (const demon of initialDemons) {
    await prisma.demon.upsert({
      where: { position: demon.position },
      update: demon,
      create: demon
    });
  }

  await prisma.player.upsert({
    where: { name: "SamplePlayer" },
    update: {},
    create: { name: "SamplePlayer" }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
