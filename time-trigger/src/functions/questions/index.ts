import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      schedule: {
        name: "get-questions-time-trigger",
        description:
          "This function captures questions from audit-learn-winning portal",
        rate: "cron(0 1 * * ? *)",
        enabled: true
      }
      // http: {
      //   method: 'get',
      //   path: 'questions',
      // }
    }
  ]
};
