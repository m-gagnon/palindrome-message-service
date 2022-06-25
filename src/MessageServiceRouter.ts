import Express = require("express");
import { MessageService } from "./MessageService";

export function getMessageServiceRouter(): Express.Router {
  const messageServiceRouter: Express.Router = Express.Router();
  const messageService: MessageService = new MessageService();

  messageServiceRouter.get("/", async (req: Express.Request, res: Express.Response) => {
    res.send(await messageService.findAllMessages());
  });

  messageServiceRouter.get("/:messageId", async (req: Express.Request, res: Express.Response) => {
    res.send(await messageService.getMessageById(req.params.messageId));
  });

  messageServiceRouter.post("/", async (req: Express.Request, res: Express.Response) => {
    res.send(await messageService.saveMessage(req.body.message));
  });

  messageServiceRouter.put("/:messageId", async (req: Express.Request, res: Express.Response) => {
    res.send(await messageService.updateMessage(req.params.messageId, req.body.message));
  });

  messageServiceRouter.delete("/:messageId", async (req: Express.Request, res: Express.Response) => {
    res.send(await messageService.deleteMessage(req.params.messageId));
  });

  messageServiceRouter.delete("/", async (req: Express.Request, res: Express.Response) => {
    res.send(await messageService.deleteAllMessages());
  });

  return messageServiceRouter;
}