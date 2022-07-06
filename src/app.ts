import "dotenv/config";
import express = require("express");
import { getMessageServiceRouter, MESSAGE_SERVICE_BASE_PATH } from "./message-service";

const messageServiceApp: express.Application = express();

// JSON parsing and routing
messageServiceApp.use(express.json());
messageServiceApp.use(MESSAGE_SERVICE_BASE_PATH, getMessageServiceRouter());

// Error handling
messageServiceApp.use((err: any, req: express.Request, res: express.Response) => {
    console.log(`An unexpected error occurred: ${JSON.stringify(err)}`);
    if (err.type === "entity.parse.failed") {
        res.status(400).send({
            error: "Failed to parse JSON request body."
        });
    } else {
        res.status(500).send({
            error: "An unexpected error occurred."
        });
    }
});

messageServiceApp.listen(process.env.MESSAGE_SERVICE_PORT, () => {
    console.log(`Message Service running on port ${process.env.MESSAGE_SERVICE_PORT}.`);
});
