import { Task, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// update
// 1 レコードの更新
// where にはユニークなキー(複合キーでもOK)を一つ以上指定する
// 1 つ以上レコードが見つからない場合はエラー

// BEGIN
// SELECT `prisma_example`.`tasks`.`id` FROM `prisma_example`.`tasks` WHERE (`prisma_example`.`tasks`.`id` = ? AND 1=1)
// UPDATE `prisma_example`.`tasks` SET `status` = ? WHERE (`prisma_example`.`tasks`.`id` IN (?) AND (`prisma_example`.`tasks`.`id` = ? AND 1=1))
// SELECT `prisma_example`.`tasks`.`id`, `prisma_example`.`tasks`.`userId`, `prisma_example`.`tasks`.`status`, `prisma_example`.`tasks`.`deadlineAt`, `prisma_example`.`tasks`.`created_at`, `prisma_example`.`tasks`.`updated_at` FROM `prisma_example`.`tasks` WHERE `prisma_example`.`tasks`.`id` = ? LIMIT ? OFFSET ?
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
    id: 1,
    name: "test",
    tasks,
  };

  // 親である user が見つからない場合はエラー
  // `An operation failed because it depends on one or more records that were required but not found. No 'User' record (needed to update inlined relation on 'Task') was found for a nested upsert on relation 'TaskToUser'.`
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
          // prisma:query SELECT `prisma_example`.`tasks`.`id`, `prisma_example`.`tasks`.`userId` FROM `prisma_example`.`tasks` WHERE ((`prisma_example`.`tasks`.`id` NOT IN (?,?,?) AND `prisma_example`.`tasks`.`userId` = ?) AND `prisma_example`.`tasks`.`userId` IN (?))
          // 上記のクエリが実行され、レコードが見つかった場合は下記のクエリが実行される
          // prisma:query DELETE FROM `prisma_example`.`tasks` WHERE (`prisma_example`.`tasks`.`id` IN (?) AND 1=1)
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

switch (process.argv[2]) {
  case "1":
    updateTask();
    break;
  case "2":
    updateManyTask();
    break;
  case "3":
    upsertTask();
    break;
  case "4":
    updateUserWithTasks();
    break;
  default:
    console.log("no command!");
    break;
}
