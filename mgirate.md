# 特徴

- 宣言的に記述したスキーマから、SQL ファイルを生成する。
- SQL ファイルの履歴を管理する。

https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview

# メンタルモデル

https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/mental-model

- Prisma はモデル/スキーマファースト

## ワークフロー

- ローカルでスキーマを DB に同期
- PR を生成し、プレビュー環境で同期
    - deploy を使う
- PR をマージして、本番環境に同期
    - deploy を使う

## 状態管理

- SQL はデータベース変更履歴
- Migration テーブルは変更履歴とメタデータ

## DB構成

- 各環境のDB構成(バージョンとかユーザーとか)は一致している必要あり
    - 環境ごとで同じマイグレーションが実行されないといけない


## dev コマンド

- create-only で SQL の実行をせずにマイグレーションファイルを作れる
- シャドーデータベースを使用して差分を検出してマイグレーションファイルを作る
- リセットを促されるのは migrate dev の結果差分や競合が検出される時

## diff コマンド

- マイグレーションファイルと DB の差分を埋める SQL を生成できる

## deploy コマンド

- apply 済レコードと、マイグレーションファイルを比較する
- pending 状態のマイグレーションを実行する
- テーブルに新しいレコードを入れる

よくわからん

# 履歴

https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories

- migration_lock.toml はプロバイダの変更検出に必要
- マイグレーションファイルはカスタマイズOK
- _prisma_migrations テーブル
    - 実行されたかどうか
    - マイグレーションが削除されたかどうか
    - マイグレーションが変更されたかどうか
- 最終的な状態が一致していても、マイグレーションの履歴が一致していない場合は警告が出る
- リセットを促された場合は、削除されたマイグレーションファイルを復元したり、マイグレーションファイルと同じ状態になるようデータベースに変更を加える

# マイグレーションをロールバック

- 失敗したマイグレーションを成功させるためのロールバックではなく、失敗したマイグレーションを適用しない状態が最終的な状態であって欲しい場合

