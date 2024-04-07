import { Task, PrismaClient, User } from "@prisma/client";
import { rejects } from "assert";

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
// 1 レコードの削除
// where にはユニークなキー(複合キーでもOK)を一つ以上指定する
// 1 つ以上レコードが見つからない場合はエラー
function deleteTask() {
  prisma.task
    .delete({
      where: {
        id: 2,
      },
    })
    .catch((e) => {
      console.error(e);
    });
}
// 子テーブルに関連レコードがある場合はエラー
function deleteUser() {
  prisma.user
    .delete({
      where: {
        id: 1,
      },
    })
    .catch((e) => {
      console.error(e);
    });
}

// deleteMany

// get lock
function getLock() {
  prisma.$queryRaw<{ lock: bigint }[]>`SELECT GET_LOCK('lock', 1) AS 'lock'`
    .then((result) => {
      console.log(result[0].lock);

      if (result[0].lock === BigInt(0)) {
        throw new Error("lock failed");
      }

      return prisma.$queryRaw<
        { release_lock: bigint }[]
      >`SELECT RELEASE_LOCK('lock') AS 'release_lock'`;
    })
    .then((result) => {
      console.log(result[0].release_lock);
    })
    .catch((e) => {
      console.error(e);
    });
}

// select for update
function selectForUpdateNowait() {
  prisma.$queryRaw<User>`SELECT * FROM users WHERE id = 1 FOR UPDATE NOWAIT`
    .then((result) => {
      console.log(result);
    })
    .catch((e) => {
      console.error(e);
    });
}

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
  case "5":
    deleteTask();
    break;
  case "6":
    deleteUser();
    break;
  case "7":
    getLock();
    break;
  case "8":
    selectForUpdateNowait();
    break;
  default:
    console.log("no command!");
}
