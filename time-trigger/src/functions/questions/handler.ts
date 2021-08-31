import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import axios from 'axios';
import { get } from 'lodash';

import schema from "./schema";

const getJsonData = () => {
  return axios.get('https://learn.winningproduct.com/page-data/1-explore/01-product-concept-pitch-deck/page-data.json');
}

const questions: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const jsonData = await getJsonData();
    const checkList = get(jsonData, 'data.result.data.mdx.frontmatter.checklist');

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
