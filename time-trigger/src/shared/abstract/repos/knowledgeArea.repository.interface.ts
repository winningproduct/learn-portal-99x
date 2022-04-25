import { KnowledgeArea } from "src/shared/repos/mysql/entity/knowledgeArea";
import { Connection } from "typeorm";

export interface IKnowledgeAreaRepository {
  getKnowledgeAreaWithUrl(
    connection: Connection
  ): Promise<Array<KnowledgeArea>>;
}
