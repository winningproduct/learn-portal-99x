import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import axios from "axios";
import { get, forEach, find, filter, orderBy } from "lodash";

import { QuestionDraftRepository } from "src/shared/repos/questionDraft.repository";
import { QuestionDraft } from "src/shared/repos/mysql/entity/question_draft";
import { KnowledgeAreaRepository } from "../../shared/repos/knowledgeArea.repository";
import { KnowledgeDto } from "@functions/entity/knowledgeDto";
import { KnowledgeArea } from "src/shared/repos/mysql/entity/knowledgeArea";
import { initMysql } from "src/shared/repos/mysql/connection.manager";
import { Connection } from "typeorm";

function getUrl(url: string): string {
  const urlArr = url.trim().split("/");
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

function getQuestions(
  allQuestions: Array<QuestionDraft>,
  questionList: Array<QuestionDraft>
): any {
  let allMajorQuestions = [];
  let allMinorQuestions = [];
  forEach(questionList, (apiQuestion) => {
    // find all question related to that knowledge area and order id but different versions
    const questionsInKnowledgeArea = filter(
      allQuestions,
      (dbQuestion) =>
        apiQuestion.knowledgeAreaId === dbQuestion.knowledgeAreaId &&
        apiQuestion.orderId === dbQuestion.orderId
    );

    const latestQuestionsInKnowledgeArea = orderBy(
      questionsInKnowledgeArea,
      ["majorVersion"],
      ["desc"]
    );

    const latestQuestionInKnowledgeArea = latestQuestionsInKnowledgeArea[0];

    if (
      !latestQuestionInKnowledgeArea ||
      apiQuestion.majorVersion > latestQuestionInKnowledgeArea.majorVersion
    ) {
      allMajorQuestions = [...allMajorQuestions, apiQuestion];
    } else {
      // if not the same minor version then update else ignore
      const matchingVersionQuestion = find(
        latestQuestionsInKnowledgeArea,
        (knowledgeAreaQuestion) =>
          knowledgeAreaQuestion.majorVersion == apiQuestion.majorVersion &&
          (knowledgeAreaQuestion.minorVersion < apiQuestion.minorVersion ||
            knowledgeAreaQuestion.patchVersion < apiQuestion.patchVersion)
      );
      if (matchingVersionQuestion) {
        allMinorQuestions = [...allMinorQuestions, apiQuestion];
      }
    }
  });

  return {
    majorQuestionList: allMajorQuestions,
    minorQuestionList: allMinorQuestions
  };
}

async function getJsonData(knowledgeDtoList: Array<KnowledgeDto>) {
  for (let area of knowledgeDtoList) {
    const res = await axios.get(area.apiUrl);
    area.questions = get(res, "data.result.data.mdx.frontmatter.checklist");
  }
  return knowledgeDtoList;
}

const questions: ValidatedEventAPIGatewayProxyEvent<object> = async (event) => {
  try {
    const knowledgeBaseRepository = new KnowledgeAreaRepository();
    const questionDraftRepository = new QuestionDraftRepository();
    const connection: Connection = await initMysql();
    const allQuestions = await questionDraftRepository.getAllUniqueQuestions(
      connection
    );
    const getKnowledgeBaseFromDb =
      await knowledgeBaseRepository.getKnowledgeAreaWithUrl(connection);
    const knowledgeDtoList = transformKnowledgeAreaToApiUrl(
      getKnowledgeBaseFromDb
    );
    const checkListPerKnowledgeArea = await getJsonData(knowledgeDtoList);

    const questionList = new Array<QuestionDraft>();
    checkListPerKnowledgeArea.forEach((area) => {
      area.questions?.forEach((question) => {
        if (question.version != null) {
          const questionDraft = new QuestionDraft();
          questionDraft.knowledgeAreaId = area.id;
          questionDraft.questionDescription = question.question;
          questionDraft.orderId = question.order;
          questionDraft.version = question.version;
          const versioningArray = question.version?.split(".", 3);
          questionDraft.majorVersion = versioningArray[0] ?? 0;
          questionDraft.minorVersion = versioningArray[1] ?? 0;
          questionDraft.patchVersion = versioningArray[2] ?? 0;
          questionList.push(questionDraft);
        }
      });
    });

    const questionsList = getQuestions(allQuestions, questionList);

    await questionDraftRepository.addQuestions(
      connection,
      questionsList.majorQuestionList
    );

    let updateResponse = [];
    if (
      questionsList.minorQuestionList &&
      questionsList.minorQuestionList.length
    ) {
      let updatePromises = [];
      forEach(
        questionsList.minorQuestionList,
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
