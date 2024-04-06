import { Task, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// update
// 1 レコードの更新
// where にはユニークなキー(複合キーでもOK)を一つ以上指定する
// 1 つ以上レコードが見つからない場合はエラー

// BEGIN
// SELECT `express-prisma-example`.`Task`.`id` FROM `express-prisma-example`.`Task` WHERE (`express-prisma-example`.`Task`.`id` = ? AND 1=1)
// UPDATE `express-prisma-example`.`Task` SET `status` = ? WHERE (`express-prisma-example`.`Task`.`id` IN (?) AND (`express-prisma-example`.`Task`.`id` = ? AND 1=1))
// SELECT `express-prisma-example`.`Task`.`id`, `express-prisma-example`.`Task`.`userId`, `express-prisma-example`.`Task`.`status`, `express-prisma-example`.`Task`.`deadlineAt`, `express-prisma-example`.`Task`.`created_at`, `express-prisma-example`.`Task`.`updated_at` FROM `express-prisma-example`.`Task` WHERE `express-prisma-example`.`Task`.`id` = ? LIMIT ? OFFSET ?
// COMMIT

function updateTask() {
  prisma.task
    .update({
      where: {
        id: 1, // ユニークキー
        status: "TODO",
      },
      data: { status: "IN_PROGRESS" },
    })
    .catch((e) => {
      console.error(e);
    });
}

function updateUserWithTasks() {
  const tasks: {
    id: number;
    status: "TODO" | "DONE" | "IN_PROGRESS";
  }[] = [
    { id: 1, status: "TODO" },
    { id: 2, status: "DONE" },
    { id: 3, status: "IN_PROGRESS" },
  ];

  const user: {
    id: number;
    name: string;
    tasks: typeof tasks;
  } = {
    id: 2,
    name: "test",
    tasks,
  };

  prisma.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        name: "test",
        tasks: {
          upsert: user.tasks.map((task) => ({
            where: {
              id: task.id,
            },
            update: {
              status: task.status,
            },
            create: {
              status: task.status,
            },
          })),
          deleteMany: {
            id: { notIn: tasks.map((task) => task.id) },
            userId: user.id,
          },
        },
      },
    })
    .catch((e) => {
      console.error(e);
    });
}

// updateMany
// 複数のレコードを同じ値に更新
// where には任意の条件を指定する
// data には更新するカラムを指定する
// where でヒットしたデータがあると、id の上書きもできてしまうので注意
// where と data のマッピングはできない
function updateManyTask() {
  prisma.task
    .updateMany({
      where: {
        id: { in: [1, 2, 3, 4, 5] },
      },
      data: { status: "DONE" },
    })
    .catch((e) => {
      console.error(e);
    });
}

// upsert
// where にはユニークなキー(複合キーでもOK)を一つ以上指定する
function upsertTask() {
  prisma.task
    .upsert({
      where: { id: 0 },
      update: { userId: 1, status: "TODO", deadlineAt: new Date() },
      create: {
        userId: 1,
        status: "TODO",
        deadlineAt: new Date(),
      },
    })
    .catch((e) => {
      console.error(e);
    });
}

// delete

// deleteMany
