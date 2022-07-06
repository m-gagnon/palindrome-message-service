import { MessageEntity } from "./entities";
import { DataSource, Repository } from "typeorm";
import { MESSAGE_SERVICE_DATABASE_NAME } from ".";
import express from "express";

const isPalindrome = require("is-palindrome");

export class MessageService {
    constructor(
    private messageDataSource: DataSource = new DataSource({
        type: "sqlite",
        database: MESSAGE_SERVICE_DATABASE_NAME,
        entities: [MessageEntity],
        synchronize: true
    }),
    // eslint-disable-next-line no-unused-vars
    private messageRepository: Repository<MessageEntity> = messageDataSource.getRepository(MessageEntity)
    ) {
        this.messageDataSource.initialize();
    }

    async findAllMessages(res: express.Response) {
        const messages = await this.messageRepository.find();

        res.status(200).send({
            messages
        });
    }

    async getMessageById(req: express.Request, res: express.Response) {
        const messageId: string = req.params.messageId;

        const messageEntity: MessageEntity | null = await this.messageRepository.findOne({
            where: {
                id: req.params.messageId
            }
        });

        if (!messageEntity) {
            res.status(404).send({
                error: `No message with ID ${messageId} was found.`
            });
            return;
        }

        res.status(200).send(messageEntity);
    }

    async saveMessage(req: express.Request, res: express.Response) {
        const message: string = req.body.message;

        if (!message) {
            res.status(400).send({
                error: "Invalid request body. No message specified."
            });
            return;
        }
        if (typeof message !== "string") {
            res.status(400).send({
                error: "Message specified is not of type string."
            });
            return;
        }

        const messageEntity: MessageEntity = new MessageEntity();

        messageEntity.message = message;
        messageEntity.isPalindrome = isPalindrome(message, false);

        const savedMessage: MessageEntity = await this.messageRepository.save(messageEntity);

        res.status(201).send(savedMessage);
    }

    async updateMessage(req: express.Request, res: express.Response) {
        const messageId: string = req.params.messageId;
        const newMessage: string = req.body.message;

        if (!newMessage) {
            res.status(400).send({
                error: "Invalid request body. No message specified."
            });
            return;
        }
        if (typeof newMessage !== "string") {
            res.status(400).send({
                error: "Message specified is not of type string."
            });
            return;
        }

        const savedMessage: MessageEntity | null = await this.messageRepository.findOne({
            where: {
                id: messageId
            }
        });

        if (!savedMessage) {
            res.status(404).send({
                error: `No message with ID ${messageId} was found.`
            });
            return;
        }

        savedMessage.message = newMessage;
        savedMessage.isPalindrome = isPalindrome(newMessage, false);

        await this.messageRepository.update(messageId, savedMessage);

        res.status(200).send(savedMessage);
    }

    async deleteMessage(req: express.Request, res: express.Response) {
        const messageId: string = req.params.messageId;

        await this.messageRepository.delete(messageId);

        res.status(204).send();
    }

    async deleteAllMessages(res: express.Response) {
        await this.messageRepository.clear();
        res.status(204).send();
    }
}
