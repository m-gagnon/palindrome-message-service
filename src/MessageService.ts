import { MessageEntity } from "./entities/MessageEntity";
import { DataSource, Repository, DeleteResult } from "typeorm";

const isPalindrome = require("is-palindrome");

export class MessageService {
  constructor(
    private messageDataSource: DataSource = new DataSource({
      type: "sqlite",
      database: "messageservicedb.sql",
      entities: [ MessageEntity ],
      synchronize: true,
    }),
    private messageRepository: Repository<MessageEntity> = messageDataSource.getRepository(MessageEntity),
  ) {
    this.messageDataSource.initialize();
  }

  async findAllMessages() {
    return {
      messages: await this.messageRepository.find(),
    }
  }

  async getMessageById(messageId: string) {
    return {
      message: await this.messageRepository.findOne({
        where: {
          id: messageId,
        }
      }),
    }
  }

  async saveMessage(message: string) {
    const messageEntity = new MessageEntity();
    messageEntity.message = message;
    messageEntity.isPalindrome = isPalindrome(message, false);

    const savedMessage: MessageEntity = await this.messageRepository.save(messageEntity);

    return savedMessage;
  }

  async updateMessage(messageId: string, newMessage: string) {
    let savedMessage: MessageEntity | null = await this.messageRepository.findOne({
      where: {
        id: messageId,
      }
    });

    if (savedMessage === null) {
      return;
    }

    savedMessage.message = newMessage;
    savedMessage.isPalindrome = isPalindrome(newMessage, false);

    await this.messageRepository.update(messageId, savedMessage);

    return savedMessage;
  }

  async deleteMessage(messageId: string) {
    await this.messageRepository.delete(messageId);

    return {
      id: messageId,
    };
  }

  async deleteAllMessages() {
    await this.messageRepository.clear()

    return;
  }
}