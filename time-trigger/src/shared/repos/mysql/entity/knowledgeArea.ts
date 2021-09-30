import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

const ENTITY_NAME = 'KnowledgeArea';

@Entity(ENTITY_NAME)
export class KnowledgeArea {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    score: number;

    @Column()
    phaseId!: number;

    @Column()
    url!: string;
}
