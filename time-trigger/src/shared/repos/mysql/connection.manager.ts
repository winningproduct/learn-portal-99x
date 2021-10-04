import { Connection, getConnectionManager } from "typeorm";
import { QuestionDraft } from "./entity/question_draft";
import { KnowledgeArea } from "./entity/knowledgeArea";

const {
  env: { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD}
  } = process;

let _connection: Connection = null;

export async function initMysql() {
  if (_connection && _connection.isConnected) {
    return _connection;
  } else {
    const connectionManager = getConnectionManager();
    const connection = connectionManager.create({
      name: "default",
      type: "mysql",
      host: DB_HOST,
      port: 3306,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [QuestionDraft, KnowledgeArea],
      synchronize: false,
      logging: false
    });
    _connection = await connection.connect();
    return _connection;
  }
}
