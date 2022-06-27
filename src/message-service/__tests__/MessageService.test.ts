import { DataSource, Repository } from "typeorm";
import { MessageService } from "..";
import { MessageEntity } from "../entities";
import * as express from "express";

describe("MessageService ", () => {
    let mockDataSource: DataSource;
    let mockMessageRepository: Repository<MessageEntity>;
    let messageService: MessageService;

    let mockResponse: express.Response;
    const mockSend: Function = jest.fn();


    beforeAll(() => {
        mockDataSource = {
            initialize: jest.fn()
        } as unknown as DataSource;
        mockMessageRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn()
        } as unknown as Repository<MessageEntity>;

        mockResponse = {
            status: jest.fn().mockReturnValue({
                send: mockSend
            })
        } as unknown as express.Response;

        messageService = new MessageService(mockDataSource, mockMessageRepository);

        // Ensure the data source has been initialized
        expect(mockDataSource.initialize).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("find all messages ", () => {
        const mockMessages = [
            {
                id: "message-id-1",
                message: "Not a palindrome!",
                isPalindrome: false
            },
            {
                id: "message-id-2",
                message: "A Palindrome!emordnilaP A",
                isPalindrome: true
            }
        ];

        it("should return a 200 if successful", async () => {
            const findSpy = jest.spyOn(mockMessageRepository, "find").mockResolvedValueOnce(mockMessages);

            await messageService.findAllMessages(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                messages: mockMessages
            });
            expect(findSpy).toHaveBeenCalledTimes(1);
            expect(findSpy).toHaveBeenCalledWith();
        });

        it("should return a 500 if an unexpected error occurs", async () => {
            const findSpy = jest.spyOn(mockMessageRepository, "find").mockImplementationOnce(() => {
                throw new Error("An unexpected error");
            });

            await messageService.findAllMessages(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "An unexpected error occurred."
            });
            expect(findSpy).toHaveBeenCalledTimes(1);
            expect(findSpy).toHaveBeenCalledWith();
        });
    });

    describe("get message by ID ", () => {
        const mockMessage = {
            id: "message-id-1",
            message: "Not a palindrome!",
            isPalindrome: false
        };

        const mockRequest = {
            params: {
                messageId: "message-id-1"
            }
        } as unknown as express.Request;

        it("should return a 200 if successful", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne").mockResolvedValueOnce(mockMessage);

            await messageService.getMessageById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith(mockMessage);
            expect(findOneSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    id: "message-id-1"
                }
            });
        });

        it("should return a 404 if no message was found", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne").mockResolvedValueOnce(null);

            await messageService.getMessageById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "No message with ID message-id-1 was found."
            });
            expect(findOneSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    id: "message-id-1"
                }
            });
        });

        it("should return a 500 if an unexpected error occurs", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne").mockImplementationOnce(() => {
                throw new Error("An unexpected error");
            });

            await messageService.getMessageById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "An unexpected error occurred."
            });
            expect(findOneSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    id: "message-id-1"
                }
            });
        });
    });

    describe("save message ", () => {
        const mockMessage = {
            id: "message-id-1",
            message: "Not a palindrome!",
            isPalindrome: false
        };

        const mockRequest = {
            body: {
                message: "Not a palindrome!"
            }
        } as unknown as express.Request;

        it("should return a 200 if successful", async () => {
            const saveSpy = jest.spyOn(mockMessageRepository, "save").mockResolvedValueOnce(mockMessage);

            await messageService.saveMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith(mockMessage);
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(saveSpy).toHaveBeenCalledWith({
                message: "Not a palindrome!",
                isPalindrome: false
            } as MessageEntity);
        });

        it("should return a 400 if no message was provided", async () => {
            const saveSpy = jest.spyOn(mockMessageRepository, "save");

            await messageService.saveMessage({
                body: {}
            } as unknown as express.Request, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "Invalid request body. No message specified."
            });
            expect(saveSpy).toHaveBeenCalledTimes(0);
        });

        it("should return a 500 if an unexpected error occurs", async () => {
            const saveSpy = jest.spyOn(mockMessageRepository, "save").mockImplementationOnce(() => {
                throw new Error("An unexpected error");
            });

            await messageService.saveMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "An unexpected error occurred."
            });
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(saveSpy).toHaveBeenCalledWith({
                message: "Not a palindrome!",
                isPalindrome: false
            } as MessageEntity);
        });
    });

    describe("update message ", () => {
        const mockSavedMessage = {
            id: "message-id-1",
            message: "Not a palindrome!",
            isPalindrome: false
        };

        const mockUpdatedMessage = {
            id: "message-id-1",
            message: "new-message",
            isPalindrome: false
        };

        const mockRequest = {
            params: {
                messageId: "message-id-1"
            },
            body: {
                message: "new-message"
            }
        } as unknown as express.Request;

        it("should return a 200 if successful", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne").mockResolvedValueOnce(mockSavedMessage);
            const updateSpy = jest.spyOn(mockMessageRepository, "update");

            await messageService.updateMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith(mockUpdatedMessage);
            expect(findOneSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    id: "message-id-1"
                }
            });
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith("message-id-1", {
                id: "message-id-1",
                isPalindrome: false,
                message: "new-message"
            });
        });

        it("should return a 400 if no message body was provided", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne");
            const updateSpy = jest.spyOn(mockMessageRepository, "update");

            await messageService.updateMessage({
                params: {
                    messageId: "message-id-1"
                },
                body: {}
            } as unknown as express.Request, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "Invalid request body. No message specified."
            });
            expect(findOneSpy).toHaveBeenCalledTimes(0);
            expect(updateSpy).toHaveBeenCalledTimes(0);
        });

        it("should return a 404 if no message was found", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne").mockResolvedValueOnce(null);
            const updateSpy = jest.spyOn(mockMessageRepository, "update");

            await messageService.updateMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "No message with ID message-id-1 was found."
            });
            expect(findOneSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    id: "message-id-1"
                }
            });
            expect(updateSpy).toHaveBeenCalledTimes(0);
        });

        it("should return a 500 if an unexpected error occurs", async () => {
            const findOneSpy = jest.spyOn(mockMessageRepository, "findOne").mockImplementationOnce(() => {
                throw new Error("An unexpected error");
            });
            const updateSpy = jest.spyOn(mockMessageRepository, "update");

            await messageService.updateMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "An unexpected error occurred."
            });
            expect(findOneSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: {
                    id: "message-id-1"
                }
            });
            expect(updateSpy).toHaveBeenCalledTimes(0);
        });
    });

    describe("delete message by ID ", () => {
        const mockRequest = {
            params: {
                messageId: "message-id-1"
            }
        } as unknown as express.Request;

        it("should return a 204 if successful", async () => {
            const deleteSpy = jest.spyOn(mockMessageRepository, "delete");

            await messageService.deleteMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(deleteSpy).toHaveBeenCalledTimes(1);
            expect(deleteSpy).toHaveBeenCalledWith("message-id-1");
        });

        it("should return a 500 if an unexpected error occurs", async () => {
            const deleteSpy = jest.spyOn(mockMessageRepository, "delete").mockImplementationOnce(() => {
                throw new Error("An unexpected error");
            });

            await messageService.deleteMessage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "An unexpected error occurred."
            });
            expect(deleteSpy).toHaveBeenCalledTimes(1);
            expect(deleteSpy).toHaveBeenCalledWith("message-id-1");
        });
    });

    describe("delete all messages ", () => {
        it("should return a 204 if successful", async () => {
            const clearSpy = jest.spyOn(mockMessageRepository, "clear");

            await messageService.deleteAllMessages(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(clearSpy).toHaveBeenCalledWith();
        });

        it("should return a 500 if an unexpected error occurs", async () => {
            const clearSpy = jest.spyOn(mockMessageRepository, "clear").mockImplementationOnce(() => {
                throw new Error("An unexpected error");
            });

            await messageService.deleteAllMessages(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledWith({
                error: "An unexpected error occurred."
            });
            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(clearSpy).toHaveBeenCalledWith();
        });
    });
});
