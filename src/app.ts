import "dotenv/config";
import express = require("express");
import { getMessageServiceRouter, MESSAGE_SERVICE_BASE_PATH } from "./message-service";

const messageServiceApp: express.Application = express();

messageServiceApp.use(express.json());
messageServiceApp.use(MESSAGE_SERVICE_BASE_PATH, getMessageServiceRouter());

messageServiceApp.listen(process.env.MESSAGE_SERVICE_PORT, () => {
    console.log(`Message Service running on port ${process.env.MESSAGE_SERVICE_PORT}.`);
});
