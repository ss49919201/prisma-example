import { Prisma, PrismaClient } from "@prisma/client";

export type TransactionClient = {};

export type TxMng = {
  do<T>(cb: (tx: TransactionClient) => Promise<T>): Promise<T>;
};

export type PrismaTransactionClient = {
  readonly prismaTransaction: Prisma.TransactionClient;
};

export class PrismaTransactionMng implements TxMng {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async do<T>(cb: (tx: PrismaTransactionClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await cb({
        prismaTransaction: tx,
      });
    });
  }
}
