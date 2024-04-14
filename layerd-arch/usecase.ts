import { PrismaClient } from "@prisma/client";
import { UserRepo } from "./repository";
import { TransactionMng } from "./transactionManager";

type CreateUserProps = {
  name: string;
  email: string;
};

const CreateUser = async (
  userRepo: UserRepo,
  txMng: TransactionMng,
  { name, email }: CreateUserProps
) => {
  return await txMng.do(async (tx) => {
    await userRepo.saveTx(tx, {
      id: 0,
      name,
      email,
    });
  });
};

const prisma = new PrismaClient({
  log: ["query"],
});
const userRepo = new UserRepo(prisma);
const txMng = new TransactionMng(prisma);

CreateUser(userRepo, txMng, {
  name: "Alice",
  email: `example+${new Date().getTime()}.com`,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
