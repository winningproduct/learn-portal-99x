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
      // const questionDraft = new QuestionDraft();
      // questionDraft.orderId = Number(_questionDraft.orderId);
      // questionDraft.questionDescription = _questionDraft.questionDescription;
      // questionDraft.knowledgeAreaId = Number(_questionDraft.knowledgeAreaId);
      // questionDraft.version = _questionDraft.version;
      // questionDraft.majorVersion = _questionDraft.majorVersion;
      // questionDraft.minorVersion = _questionDraft.minorVersion;
      // questionDraft.patchVersion = _questionDraft.patchVersion;
      await connection.manager.save(_questionDraft);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
