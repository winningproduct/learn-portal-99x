import type { AWS } from "@serverless/typescript";

import questions from "@functions/questions";

const serverlessConfiguration: AWS = {
  service: "time-trigger",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true
    },
    prune: {
      automatic: true,
      number: 5
    }
  },
  plugins: [
    "serverless-webpack",
    "serverless-offline",
    "serverless-prune-plugin"
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "${opt:stage, 'dev'}",
    region: "ap-south-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DB_HOST: "${ssm:/dbHost/${self:provider.stage}~true}",
      DB_NAME: "${ssm:/dbName/${self:provider.stage}~true}",
      DB_USERNAME: "${ssm:/dbUsername/${self:provider.stage}~true}",
      DB_PASSWORD: "${ssm:/dbPassword/${self:provider.stage}~true}"
    },
    lambdaHashingVersion: "20201221"
  },
  // import the function via paths
  functions: { questions }
};

module.exports = serverlessConfiguration;
