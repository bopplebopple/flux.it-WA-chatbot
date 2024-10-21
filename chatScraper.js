const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

// Create a new client instance with Local Authentication
const client = new Client({
    authStrategy: new LocalAuth()
});

// When the client receives a QR code, generate it in the terminal
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// When the client is ready, run this code (only once)
client.on('ready', async () => {
    console.log('Client is ready!');

    // Launch Puppeteer to scrape chat messages
    const browser = await puppeteer.launch({ headless: false }); // Set to false to see the browser
    const page = await browser.newPage();

    // Go to WhatsApp Web
    await page.goto('https://web.whatsapp.com');

    // Wait for the user to scan the QR code (handled by whatsapp-web.js)
    await page.waitForSelector('._1JNuk'); // Wait for the main chat view to load MUST INSPECT WAWEB IF SELECTOR IS SAME

    // Click on the first chat in the list
    await page.click('div[role="row"]:first-child'); // Clicks the first chat

    // Wait for chat messages to load
    await page.waitForSelector('div.message-in, div.message-out'); //MUST INSPECT WAWEB IF SELECTOR IS SAME

    // Scroll and fetch messages
    const messages = [];
    let previousHeight;

    while (true) {
        // Get current messages
        const newMessages = await page.evaluate(() => {
            const messageElements = document.querySelectorAll('div.message-in, div.message-out'); //MUST INSPECT WAWEB IF SELECTOR IS SAME
            const chatMessages = [];
            messageElements.forEach((messageElement) => {
                const messageText = messageElement.querySelector('span.selectable-text')?.innerText || '';
                const messageTime = messageElement.querySelector('span[data-testid="msg-time"]')?.innerText || '';
                chatMessages.push({ text: messageText, time: messageTime });
            });
            return chatMessages;
        });

        // Add new messages to the list
        messages.push(...newMessages);

        // Scroll to the top to load more messages
        await page.evaluate(() => {
            const chatContainer = document.querySelector('div[role="log"]');
            chatContainer.scrollTop = 0; // Scroll to the top
        });

        // Wait for new messages to load
        await page.waitForTimeout(2000); // Wait for a couple of seconds for messages to load

        // Check if we reached the top of the chat
        const currentHeight = await page.evaluate(() => document.querySelector('div[role="log"]').scrollHeight);
        if (currentHeight === previousHeight) {
            break; // Exit if we are at the top
        }
        previousHeight = currentHeight;
    }

    // Output the fetched messages
    console.log('Full Chat from the First Chat:');
    messages.forEach(msg => {
        console.log(`[${msg.time}] ${msg.text}`);
    });

    // Close the browser when done
    await browser.close();
});

// Start the WhatsApp client
client.initialize();
