import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

const prisma = new PrismaClient({
  log: ["query"],
}).$extends(
  readReplicas({
    url: "mysql://root:password@localhost:3307/prisma_example",
  })
);

const main = async () => {
  // use writer
  await prisma.user.create({
    data: {
      name: "name",
      email: `${Date.now()}@example.com`,
    },
  });

  // use writer explict
  await prisma.$primary().user.create({
    data: {
      name: "name",
      email: `${Date.now()}@example.com`,
    },
  });

  // use read replicas
  await prisma.user.findFirst({
    where: {
      id: 1,
    },
  });

  // use read replicas explict
  await prisma.$replica().user.findFirst({
    where: {
      id: 1,
    },
  });
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
