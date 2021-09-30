import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import axios from 'axios';
import { get } from 'lodash';

import schema from "./schema";
import { QuestionDraftRepository } from "src/shared/repos/questionDraft.repository";
import { QuestionDraft } from "src/shared/repos/mysql/entity/question_draft";
import {KnowledgeAreaRepository} from "../../shared/repos/knowledgeArea.repository";
import { KnowledgeDto } from "@functions/entity/knowledgeDto";
import { KnowledgeArea } from "src/shared/repos/mysql/entity/knowledgeArea";


function getUrl(url: string): string{
  var urlArr = url.trim().split("/");
  return 'https://learn.winningproduct.com/page-data/' + urlArr[3] + '/' +  urlArr[4] + '/page-data.json';
}

function transformKnowledgeAreaToApiUrl(knowledgeArea: Array<KnowledgeArea>) : Array<KnowledgeDto> {
  var result = knowledgeArea.map(area => <KnowledgeDto>{
    id: area.id,
    url: area.url,
    phaseId: area.phaseId,
    apiUrl: getUrl(area.url)
  });
  return result;
}

async function getJsonData(knowledgeDtoList: Array<KnowledgeDto>) {
  for (let area of knowledgeDtoList) {
    var res = await axios.get(area.apiUrl);
    area.questions = get(res, 'data.result.data.mdx.frontmatter.checklist');
  }
  return knowledgeDtoList;
}

const questions: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {

    var knowledgeBaseRepository = new KnowledgeAreaRepository();
    var getKnowldegeBaseFromDb = await knowledgeBaseRepository.getKnowledgeAreaWithUrl();
    var knowledgeDtoList = await transformKnowledgeAreaToApiUrl(getKnowldegeBaseFromDb);
    var checkListPerKnowldgeArea = await getJsonData(knowledgeDtoList);

    var questionList = new Array<QuestionDraft>();
    checkListPerKnowldgeArea.forEach(area => {
      area.questions?.forEach(question => {
        if(question.version != null){
          var questionDraft = new QuestionDraft();
          questionDraft.knowledgeAreaId = area.id;
          questionDraft.questionDescription = question.question;
          questionDraft.orderId = question.order;
          questionDraft.version = question.version;
          var versioningArray = question.version?.split(".", 3);
          questionDraft.majorVersion = versioningArray[0] ?? 0;
          questionDraft.minorVersion = versioningArray[1] ?? 0;
          questionDraft.patchVersion = versioningArray[2] ?? 0;
          questionList.push(questionDraft);
        }
      })
    })

    var questionDraftRepository = new QuestionDraftRepository();
    await questionDraftRepository.addQuestion(questionList);
  return formatJSONResponse({
    message: questionList
  });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({
      message: error.message
    }, 500)
  }
};

export const main = middyfy(questions);

