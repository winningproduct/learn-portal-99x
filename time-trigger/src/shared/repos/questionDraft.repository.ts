import { IQuestionDraftRepository } from '../abstract/repos/questionDraft.repository.interface';
import { initMysql } from './mysql/connection.manager';
import { QuestionDraft } from './mysql/entity/question_draft';
import {AbstractRepository, EntityRepository} from "typeorm";

@EntityRepository(QuestionDraft)
export class QuestionDraftRepository extends AbstractRepository<QuestionDraft> implements IQuestionDraftRepository {
  async addQuestion(_questionDraft: Array<QuestionDraft>): Promise<boolean> {
    let connection: any;
    try {
      connection = await initMysql();
      await connection.manager.save(_questionDraft);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async getAllQuestions(): Promise<Array<QuestionDraft>> {
    let connection: any;
    try {
        connection = await initMysql();
        return await connection.getRepository().getMany();
    } catch (err) {
        throw err;
    }
  }

  async updateQuestions(): Promise<Array<QuestionDraft>> {
    let connection: any;
    try {
        connection = await initMysql();
        return await connection.getRepository().getMany();
    } catch (err) {
        throw err;
    }
  }
}
