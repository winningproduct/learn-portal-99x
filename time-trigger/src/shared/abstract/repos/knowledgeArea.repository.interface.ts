import { KnowledgeArea } from 'src/shared/repos/mysql/entity/knowledgeArea';

export interface IKnowledgeAreaRepository {
    getKnowledgeAreaWithUrl(): Promise<KnowledgeArea>
}
