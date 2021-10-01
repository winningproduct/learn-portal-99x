import { Connection, getConnectionManager } from "typeorm";
import { QuestionDraft } from "./entity/question_draft";
import { KnowledgeArea } from "./entity/knowledgeArea";

let _connection: Connection = null;

export async function initMysql() {
  if (_connection && _connection.isConnected) {
    return _connection;
  } else {
    const connectionManager = getConnectionManager();
    const connection = connectionManager.create({
      name: "default",
      type: "mysql",
      host: "",
      port: 3306,
      username: "",
      password: "",
      database: "",
      entities: [QuestionDraft, KnowledgeArea],
      synchronize: false,
      logging: false
    });
    _connection = await connection.connect();
    return _connection;
  }
}
