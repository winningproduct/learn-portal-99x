import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import axios from "axios";
import { get, forEach, find } from "lodash";

import schema from "./schema";
import { QuestionDraftRepository } from "src/shared/repos/questionDraft.repository";
import { QuestionDraft } from "src/shared/repos/mysql/entity/question_draft";
import { KnowledgeAreaRepository } from "../../shared/repos/knowledgeArea.repository";
import { KnowledgeDto } from "@functions/entity/knowledgeDto";
import { KnowledgeArea } from "src/shared/repos/mysql/entity/knowledgeArea";
import { initMysql } from "src/shared/repos/mysql/connection.manager";
import { Connection } from "typeorm";

function getUrl(url: string): string {
  var urlArr = url.trim().split("/");
  return (
    "https://learn.winningproduct.com/page-data/" +
    urlArr[3] +
    "/" +
    urlArr[4] +
    "/page-data.json"
  );
}

function transformKnowledgeAreaToApiUrl(
  knowledgeArea: Array<KnowledgeArea>
): Array<KnowledgeDto> {
  return knowledgeArea.map(
    (area) =>
      <KnowledgeDto>{
        id: area.id,
        url: area.url,
        phaseId: area.phaseId,
        apiUrl: getUrl(area.url)
      }
  );
}

function getMajorQuestions(
  allQuestions: Array<QuestionDraft>,
  questionList: Array<QuestionDraft>
) {
  let allMajorQuestions = [];
  forEach(questionList, (apiQuestion) => {
    const majorQuestion = find(
      allQuestions,
      (dbQuestion) =>
        apiQuestion.orderId === dbQuestion.orderId &&
        apiQuestion.majorVersion > dbQuestion.majorVersion
    );
    if (majorQuestion) {
      allMajorQuestions = [...allMajorQuestions, majorQuestion];
    } else {
      allMajorQuestions = [...allMajorQuestions, apiQuestion];
    }
  });
  return allMajorQuestions;
}

function getMinorQuestions(
  allQuestions: Array<QuestionDraft>,
  questionList: Array<QuestionDraft>
) {
  let allMinorQuestions = [];
  forEach(questionList, (apiQuestion) => {
    const majorQuestion = find(
      allQuestions,
      (dbQuestion) =>
        apiQuestion.orderId === dbQuestion.orderId &&
        apiQuestion.majorVersion === dbQuestion.majorVersion
    );
    if (majorQuestion)
      allMinorQuestions = [...allMinorQuestions, majorQuestion];
  });
  return allMinorQuestions;
}

async function getJsonData(knowledgeDtoList: Array<KnowledgeDto>) {
  for (let area of knowledgeDtoList) {
    var res = await axios.get(area.apiUrl);
    area.questions = get(res, "data.result.data.mdx.frontmatter.checklist");
  }
  return knowledgeDtoList;
}

const questions: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const knowledgeBaseRepository = new KnowledgeAreaRepository();
    const questionDraftRepository = new QuestionDraftRepository();
    const connection: Connection = await initMysql();
    const allQuestions = await questionDraftRepository.getAllUniqueQuestions(
      connection
    );
    const getKnowldegeBaseFromDb =
      await knowledgeBaseRepository.getKnowledgeAreaWithUrl(connection);
    const knowledgeDtoList = transformKnowledgeAreaToApiUrl(
      getKnowldegeBaseFromDb
    );
    const checkListPerKnowldgeArea = await getJsonData(knowledgeDtoList);

    const questionList = new Array<QuestionDraft>();
    checkListPerKnowldgeArea.forEach((area) => {
      area.questions?.forEach((question) => {
        if (question.version != null) {
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
      });
    });

    const insertQuestionsList = getMajorQuestions(allQuestions, questionList);
    const updateQuestionsList = getMinorQuestions(allQuestions, questionList);

    const insertResponse = await questionDraftRepository.addQuestions(
      connection,
      insertQuestionsList
    );

    let updateResponse = [];
    if (updateQuestionsList && updateQuestionsList.length) {
      let updatePromises = [];
      forEach(
        updateQuestionsList,
        ({
          orderId,
          knowledgeAreaId,
          majorVersion,
          minorVersion,
          patchVersion,
          questionDescription,
          version
        }) => {
          updatePromises = [
            ...updatePromises,
            questionDraftRepository.updateQuestions(
              connection,
              orderId,
              knowledgeAreaId,
              majorVersion,
              minorVersion,
              patchVersion,
              questionDescription,
              version
            )
          ];
        }
      );
      if (updatePromises && updatePromises.length)
        updateResponse = await Promise.allSettled(updatePromises);
    }
    return formatJSONResponse({
      message: [updateResponse]
    });
  } catch (error) {
    console.error(error);
    return formatJSONResponse(
      {
        message: error.message
      },
      500
    );
  }
};

export const main = middyfy(questions);
