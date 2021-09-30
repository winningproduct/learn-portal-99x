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

function getJsonData() {



  return axios.get('https://learn.winningproduct.com/page-data/1-explore/01-product-concept-pitch-deck/page-data.json');
}

const questions: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {

    var knowledgeBaseRepository = new KnowledgeAreaRepository();
    var getKnowldegeBaseFromDb = await knowledgeBaseRepository.getKnowledgeAreaWithUrl();

    const jsonData = await getJsonData();
    const checkList = get(jsonData, 'data.result.data.mdx.frontmatter.checklist');;

    var questionDraft = new QuestionDraft();
    questionDraft.knowledgeAreaId = 2;
    questionDraft.questionDescription = checkList[0].question;
    questionDraft.orderId = checkList[0].order;
    questionDraft.version = checkList[0].version;
    var versioningArray = checkList[0].version.split(".", 3);
    questionDraft.majorVersion = versioningArray[0];
    questionDraft.minorVersion = versioningArray[1];
    questionDraft.patchVersion = versioningArray[2];

    var questionDraftRepository = new QuestionDraftRepository();
    await questionDraftRepository.addQuestion(questionDraft);
  return formatJSONResponse({
    message: getKnowldegeBaseFromDb
  });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({
      message: error.message
    }, 500)
  }
};

export const main = middyfy(questions);
