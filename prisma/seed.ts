import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

async function main() {
  await prisma.user.create({
    data: {
      name: "Alice",
      email: `example+${new Date().getTime()}.com`,
      tasks: {
        create: {
          status: "TODO",
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
