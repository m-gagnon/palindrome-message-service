import Express = require("express");
import { getMessageServiceRouter } from "./MessageServiceRouter";
import { MESSAGE_SERVICE_BASE_PATH } from "./MessageServiceConstants";

const messageServiceApp: Express.Application = Express();

messageServiceApp.use(Express.json());
messageServiceApp.use(MESSAGE_SERVICE_BASE_PATH, getMessageServiceRouter());

messageServiceApp.listen(process.env.REST_API_PORT, () => {
  console.log(`Message Service running on port ${process.env.REST_API_PORT}.`);
});
