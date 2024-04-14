import { Prisma, PrismaClient } from "@prisma/client";

export type TransactionClient = {
  prismaTransaction: Prisma.TransactionClient;
};

export class TransactionMng {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async do<T>(cb: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await cb({
        prismaTransaction: tx,
      });
    });
  }
}
