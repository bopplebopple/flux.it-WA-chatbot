const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Function to fetch all messages from a chat by contact name
async function fetchMessagesFromContact(contactName) {
    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        console.log('Client is ready!');

        // Fetch all chats
        const chats = await client.getChats();

        // Find the chat by contact name
        const contactChat = chats.find(chat => chat.name.toLowerCase() === contactName.toLowerCase());

        if (!contactChat) {
            console.log(`Chat with contact "${contactName}" not found.`);
            return;
        }

        console.log(`Fetching messages from chat: ${contactChat.name}`);

        let allMessages = [];
        const messageLimit = 100; // Set the limit to 100 messages
        let keepFetching = true;

        while (keepFetching) {
            try {
                // Fetch messages before the lastMessage ID or from the beginning
                const messages = await contactChat.fetchMessages({
                    limit: messageLimit,
                });

                // If no messages are fetched, stop
                if (messages.length === 0) {
                    console.log('No more messages to fetch.');
                    break; // Break out of the while loop
                }

                // Check if the messages fetched are already in allMessages
                const newMessages = messages.filter(msg => !allMessages.some(existingMsg => existingMsg.id._serialized === msg.id._serialized));

                if (newMessages.length === 0) {
                    console.log('No new messages found, stopping fetch.');
                    break; // Break if no new messages
                }

                allMessages.push(...newMessages); // Add only new messages to the array

                // Log how many more messages were fetched
                console.log(`Fetched ${newMessages.length} new messages, total so far: ${allMessages.length}`);

                // If total fetched messages exceed or equal the limit, stop fetching
                if (allMessages.length >= messageLimit) {
                    console.log(`Reached the limit of ${messageLimit} messages.`);
                    keepFetching = false; // Stop fetching
                }

                // Small delay to prevent throttling
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error fetching messages:', error);
                keepFetching = false;
            }
        }

        // Trim the messages if more than 100 were fetched
        if (allMessages.length > messageLimit) {
            allMessages = allMessages.slice(0, messageLimit);
        }

        // Display the fetched messages
        console.log(`Fetched ${allMessages.length} messages from ${contactChat.name}:`);
        allMessages.reverse().forEach(msg => {
            const time = msg.timestamp ? new Date(msg.timestamp * 1000).toLocaleTimeString() : 'Unknown time';
            console.log(`[${time}] ${msg.body}`);
        });
    });

    client.initialize();
}

module.exports = fetchMessagesFromContact;
