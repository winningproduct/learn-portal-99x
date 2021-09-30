import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import axios from 'axios';
import { get } from 'lodash';

import schema from "./schema";
import { MySQLQuestionDraftRepository } from "src/shared/repos/questionDraft.repository";
import { QuestionDraft } from "src/shared/repos/mysql/entity/question_draft";

const getJsonData = () => {
  return axios.get('https://learn.winningproduct.com/page-data/1-explore/01-product-concept-pitch-deck/page-data.json');
}

const questions: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const jsonData = await getJsonData();
    const checkList = get(jsonData, 'data.result.data.mdx.frontmatter.checklist');;

    var questionDraft = new QuestionDraft();
    questionDraft.knowledgeAreaId = 2;
    questionDraft.questionDescription = checkList[0].question;
    questionDraft.id = checkList[0].order;
    questionDraft.version = checkList[0].version;
    questionDraft.majorVersion = 1;
    questionDraft.minorVersion = 1;
    questionDraft.patchVersion = 2;

    var mysqlquestionDraftRepository = new MySQLQuestionDraftRepository();
    await mysqlquestionDraftRepository.addQuestion(questionDraft);

  return formatJSONResponse({
    message: checkList
  });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({
      message: error.message
    }, 500)
  }
};

export const main = middyfy(questions);
