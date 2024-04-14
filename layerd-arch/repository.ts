import { Prisma, PrismaClient, User } from "@prisma/client";

export class UserRepo {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  private async _save<T extends User>(
    prisma: PrismaClient | Prisma.TransactionClient,
    user: T
  ): Promise<void> {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }
  async save<T extends User>(user: T): Promise<void> {
    await this._save(this.prisma, user);
  }
  async saveTx<T extends User>(
    tx: Prisma.TransactionClient,
    user: T
  ): Promise<void> {
    await this._save(tx, user);
  }
}
