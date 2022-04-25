import { IQuestionDraftRepository } from "../abstract/repos/questionDraft.repository.interface";

import { QuestionDraft } from "./mysql/entity/question_draft";
import {
  AbstractRepository,
  EntityRepository,
  Connection,
  InsertResult,
  UpdateResult
} from "typeorm";

@EntityRepository(QuestionDraft)
export class QuestionDraftRepository
  extends AbstractRepository<QuestionDraft>
  implements IQuestionDraftRepository
{
  async addQuestions(
    connection: Connection,
    questionDraft: Array<QuestionDraft>
  ): Promise<InsertResult> {
    return connection
      .getRepository(QuestionDraft)
      .createQueryBuilder()
      .insert()
      .into(QuestionDraft)
      .values(questionDraft)
      .execute();
  }

  async getAllUniqueQuestions(
    connection: Connection
  ): Promise<Array<QuestionDraft>> {
    return connection
      .getRepository(QuestionDraft)
      .createQueryBuilder("questiondraft")
      .getMany();
  }

  async updateQuestions(
    connection: Connection,
    orderId: number,
    knowledgeAreaId: number,
    majorVersion: number,
    minorVersion: number,
    patchVersion: number,
    title: string,
    description: string,
    version: string
  ): Promise<UpdateResult> {
    return connection
      .getRepository(QuestionDraft)
      .createQueryBuilder()
      .update(QuestionDraft)
      .set({ minorVersion, patchVersion, title, description, version })
      .where("orderId = :orderId", { orderId })
      .andWhere("knowledgeAreaId = :knowledgeAreaId", {
        knowledgeAreaId
      })
      .andWhere("majorVersion = :majorVersion", { majorVersion })
      .execute();
  }
}
