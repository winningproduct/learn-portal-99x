import { IKnowledgeAreaRepository } from "../abstract/repos/knowledgeArea.repository.interface";
import { KnowledgeArea } from "./mysql/entity/knowledgeArea";
import { AbstractRepository, EntityRepository, Connection } from "typeorm";
import { QuestionDraft } from "./mysql/entity/question_draft";

@EntityRepository(QuestionDraft)
export class KnowledgeAreaRepository
  extends AbstractRepository<KnowledgeArea>
  implements IKnowledgeAreaRepository
{
  async getKnowledgeAreaWithUrl(
    connection: Connection
  ): Promise<Array<KnowledgeArea>> {
    return connection
      .getRepository(KnowledgeArea)
      .createQueryBuilder("knowledgearea")
      .getMany();
  }
}
