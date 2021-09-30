import { createConnection } from 'typeorm';
import { QuestionDraft } from './entity/question_draft';
export async function initMysql() {
  try {
    const con = await createConnection({
      type: 'mysql',
      host: '',
      port: 3306,
      username: '',
      password: '',
      database: '',
      entities: [
        QuestionDraft
      ],
      synchronize: true,
      logging: false,
    });
    return con;
  } catch (err) {
    throw err;
  }
}
