import {IKnowledgeAreaRepository} from "../abstract/repos/knowledgeArea.repository.interface";
import {KnowledgeArea} from "./mysql/entity/knowledgeArea";
import {initMysql} from "./mysql/connection.manager";
import {AbstractRepository, EntityRepository} from "typeorm";
import {QuestionDraft} from "./mysql/entity/question_draft";

@EntityRepository(QuestionDraft)
export class KnowledgeAreaRepository extends AbstractRepository<KnowledgeArea> implements IKnowledgeAreaRepository {
    async getKnowledgeAreaWithUrl(): Promise<KnowledgeArea> {
        let connection: any;
        try {
            connection = await initMysql();
            return await connection.getRepository(KnowledgeArea).createQueryBuilder("user").getMany();
        } catch (err) {
            throw err;
        }
    }
}
