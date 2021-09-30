import { QuestionDraft } from 'src/shared/repos/mysql/entity/question_draft';

export interface IQuestionDraftRepository {
  addQuestion(questionDraft: Array<QuestionDraft>): Promise<boolean>
}
