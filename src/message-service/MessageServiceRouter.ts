import express = require("express");
import { MessageService } from ".";

/**
 *
 */
export function getMessageServiceRouter(): express.Router {
    const messageServiceRouter: express.Router = express.Router();
    const messageService: MessageService = new MessageService();

    messageServiceRouter.get("/", async (req: express.Request, res: express.Response) => {
        await messageService.findAllMessages(res);
    });

    messageServiceRouter.get("/:messageId", async (req: express.Request, res: express.Response) => {
        await messageService.getMessageById(req, res);
    });

    messageServiceRouter.post("/", async (req: express.Request, res: express.Response) => {
        await messageService.saveMessage(req, res);
    });

    messageServiceRouter.patch("/:messageId", async (req: express.Request, res: express.Response) => {
        await messageService.updateMessage(req, res);
    });

    messageServiceRouter.delete("/:messageId", async (req: express.Request, res: express.Response) => {
        await messageService.deleteMessage(req, res);
    });

    messageServiceRouter.delete("/", async (req: express.Request, res: express.Response) => {
        await messageService.deleteAllMessages(res);
    });

    return messageServiceRouter;
}
