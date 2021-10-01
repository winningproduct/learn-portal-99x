import {createConnection, getConnection, getConnectionManager} from 'typeorm';
import {QuestionDraft} from './entity/question_draft';
import {KnowledgeArea} from "./entity/knowledgeArea";

export async function initMysql() {
  try {
    if(getConnectionManager().has("default")){
      return await getConnection();
    }
    else {
      return await createConnection({
        name: 'default',
        type: 'mysql',
        host: '',
        port: 3306,
        username: '',
        password: '',
        database: '',
        entities: [
          QuestionDraft,
          KnowledgeArea
        ],
        synchronize: true,
        logging: false,
      });
    }

  } catch (err) {
    throw err;
  }
}
