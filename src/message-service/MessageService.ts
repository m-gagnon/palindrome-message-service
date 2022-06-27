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
        try {
            const messages = await this.messageRepository.find();

            res.status(200).send({
                messages
            });
        } catch (e) {
            console.log(`An unexpected error occurred: ${JSON.stringify(e)}`);
            res.status(500).send({
                error: "An unexpected error occurred."
            });
        }
    }

    async getMessageById(req: express.Request, res: express.Response) {
        try {
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
        } catch (e) {
            console.log(`An unexpected error occurred: ${JSON.stringify(e)}`);
            res.status(500).send({
                error: "An unexpected error occurred."
            });
        }
    }

    async saveMessage(req: express.Request, res: express.Response) {
        try {
            const message: string = req.body.message;

            if (!message) {
                res.status(400).send({
                    error: "Invalid request body. No message specified."
                });
                return;
            }

            const messageEntity: MessageEntity = new MessageEntity();

            messageEntity.message = message;
            messageEntity.isPalindrome = isPalindrome(message, false);

            const savedMessage: MessageEntity = await this.messageRepository.save(messageEntity);

            res.status(201).send(savedMessage);
        } catch (e) {
            console.log(`An unexpected error occurred: ${JSON.stringify(e)}`);
            res.status(500).send({
                error: "An unexpected error occurred."
            });
        }
    }

    async updateMessage(req: express.Request, res: express.Response) {
        try {
            const messageId: string = req.params.messageId;
            const newMessage: string = req.body.message;

            if (!newMessage) {
                res.status(400).send({
                    error: "Invalid request body. No message specified."
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
        } catch (e) {
            console.log(`An unexpected error occurred: ${JSON.stringify(e)}`);
            res.status(500).send({
                error: "An unexpected error occurred."
            });
        }
    }

    async deleteMessage(req: express.Request, res: express.Response) {
        try {
            const messageId: string = req.params.messageId;

            await this.messageRepository.delete(messageId);

            res.status(204).send();
        } catch (e) {
            console.log(`An unexpected error occurred: ${JSON.stringify(e)}`);
            res.status(500).send({
                error: "An unexpected error occurred."
            });
        }
    }

    async deleteAllMessages(res: express.Response) {
        try {
            await this.messageRepository.clear();
            res.status(204).send();
        } catch (e) {
            console.log(`An unexpected error occurred: ${JSON.stringify(e)}`);
            res.status(500).send({
                error: "An unexpected error occurred."
            });
        }
    }
}
