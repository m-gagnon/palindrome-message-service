import "dotenv/config";
// eslint-disable-next-line node/no-unpublished-import
import axios, { AxiosInstance, AxiosResponse } from "axios";

// Ensure the message service is running and the environment variables set in .env are
// correct before running this end-to-end test!
describe("Message Service app end-to-end ", () => {
    let messageService: AxiosInstance;

    beforeAll(() => {
        messageService = axios.create({
            baseURL: `http://${process.env.MESSAGE_SERVICE_HOSTNAME}:${process.env.MESSAGE_SERVICE_PORT}`
        });
    });

    it("should be able to save, retrieve, update and delete singular messages", async () => {
        const nonPalindromicString: string = "Not a palindrome!";
        const palindromicString: string = "A Palindrome!emordnilaP A";

        // Save a message
        const saveResponse: AxiosResponse = await messageService.post("/messages", {
            message: nonPalindromicString
        });

        expect(saveResponse.status).toBe(201);
        expect(saveResponse.data).toEqual({
            message: nonPalindromicString,
            isPalindrome: false,
            id: expect.any(String)
        });

        // Retrieve the message
        const getResponse: AxiosResponse = await messageService.get(`/messages/${saveResponse.data.id}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.data).toEqual({
            message: nonPalindromicString,
            isPalindrome: false,
            id: saveResponse.data.id
        });

        // Update the message
        const updateResponse: AxiosResponse = await messageService.patch(`/messages/${saveResponse.data.id}`, {
            message: palindromicString
        });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.data).toEqual({
            message: palindromicString,
            isPalindrome: true,
            id: saveResponse.data.id
        });

        // Verify the message was updated
        const getUpdatedResponse: AxiosResponse = await messageService.get(`/messages/${saveResponse.data.id}`);

        expect(getUpdatedResponse.status).toBe(200);
        expect(getUpdatedResponse.data).toEqual({
            message: palindromicString,
            isPalindrome: true,
            id: saveResponse.data.id
        });

        // Delete the message
        const deleteResponse: AxiosResponse = await messageService.delete(`/messages/${getResponse.data.id}`);

        expect(deleteResponse.status).toBe(204);

        // Verify the message was deleted
        try {
            await messageService.get(`/messages/${getResponse.data.id}`);
            fail();
        } catch (e: any) {
            expect(e.response.status).toBe(404);
        }
    });

    it("should be able to save multiple messages, list all messages and delete all messages", async () => {
        const nonPalindromicString: string = "Not a palindrome!";
        const anotherNonPalindromicString: string = "Definitely NOT a palindrome...";
        const palindromicString: string = "A Palindrome!emordnilaP A";

        // Save a few different messages
        for (const message of [nonPalindromicString, anotherNonPalindromicString, palindromicString]) {
            const saveResponse: AxiosResponse = await messageService.post("/messages", {
                message
            });

            expect(saveResponse.status).toBe(201);
            expect(saveResponse.data).toEqual({
                message,
                isPalindrome: expect.any(Boolean),
                id: expect.any(String)
            });
        }

        // List all messages
        const listResponse: AxiosResponse = await messageService.get("/messages");

        expect(listResponse.status).toBe(200);
        expect(listResponse.data).toEqual({
            messages: expect.arrayContaining([
                {
                    message: nonPalindromicString,
                    isPalindrome: false,
                    id: expect.any(String)
                },
                {
                    message: anotherNonPalindromicString,
                    isPalindrome: false,
                    id: expect.any(String)
                },
                {
                    message: palindromicString,
                    isPalindrome: true,
                    id: expect.any(String)
                }
            ])
        });

        // Delete all messages
        const deleteResponse: AxiosResponse = await messageService.delete("/messages");

        expect(deleteResponse.status).toBe(204);

        // Verify all messages were deleted
        const listDeletedResponse: AxiosResponse = await messageService.get("/messages");

        expect(listDeletedResponse.status).toBe(200);
        expect(listDeletedResponse.data).toEqual({
            messages: []
        });
    });

    it("should receive appropriate error response and status when specifying a message ID that does not exist", async () => {
        try {
            await messageService.get("/messages/fake-message-id");
            fail();
        } catch (e: any) {
            expect(e.response.status).toBe(404);
            expect(e.response.data).toEqual({
                error: "No message with ID fake-message-id was found."
            });
        }

        try {
            await messageService.patch("/messages/fake-message-id", {
                message: "new-message"
            });
            fail();
        } catch (e: any) {
            expect(e.response.status).toBe(404);
            expect(e.response.data).toEqual({
                error: "No message with ID fake-message-id was found."
            });
        }
    });

    it("should receive appropriate error response and status when not specifying a message body", async () => {
        try {
            await messageService.post("/messages", {
                message: null
            });
            fail();
        } catch (e: any) {
            expect(e.response.status).toBe(400);
            expect(e.response.data).toEqual({
                error: "Invalid request body. No message specified."
            });
        }

        try {
            await messageService.patch("/messages/messageId", {
                message: null
            });
            fail();
        } catch (e: any) {
            expect(e.response.status).toBe(400);
            expect(e.response.data).toEqual({
                error: "Invalid request body. No message specified."
            });
        }
    });
});
