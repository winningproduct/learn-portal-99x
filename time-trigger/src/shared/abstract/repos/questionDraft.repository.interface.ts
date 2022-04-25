import { QuestionDraft } from "src/shared/repos/mysql/entity/question_draft";
import { Connection, InsertResult } from "typeorm";

export interface IQuestionDraftRepository {
  addQuestions(
    connection: Connection,
    questionDraft: Array<QuestionDraft>
  ): Promise<InsertResult>;
  getAllUniqueQuestions(connection: Connection): Promise<Array<QuestionDraft>>;
}
