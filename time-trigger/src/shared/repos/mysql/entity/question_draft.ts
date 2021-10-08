import {
    Entity,
    PrimaryGeneratedColumn,
    Column
  } from 'typeorm';

const ENTITY_NAME = 'Question_Draft';

@Entity(ENTITY_NAME)
export class QuestionDraft {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  version!: string;

  @Column()
  knowledgeAreaId!: number;

  @Column()
  majorVersion!: number;

  @Column()
  minorVersion!: number;

  @Column()
  patchVersion!: number;
}
