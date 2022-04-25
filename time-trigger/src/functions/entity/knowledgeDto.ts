import { QuestionDto } from "./QuestionDto";

export class KnowledgeDto {
    url: string;
    id: number;
    phaseId: number;
    phaseIdUrl: string;
    subCategoryUrl: string;
    apiUrl: string;
    questions: Array<QuestionDto>;
}