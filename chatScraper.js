// fetchMessages.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode-terminal');

// Function to fetch messages from the first chat
async function fetchMessages() {
    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        console.log('Client is ready!');

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto('https://web.whatsapp.com');
        await page.waitForSelector('._1JNuk'); // Main chat view

        await page.click('div[role="row"]:first-child'); // Click first chat
        await page.waitForSelector('div.message-in, div.message-out'); // Load messages

        const messages = [];
        let previousHeight;

        while (true) {
            const newMessages = await page.evaluate(() => {
                const messageElements = document.querySelectorAll('div.message-in, div.message-out');
                return Array.from(messageElements).map(messageElement => {
                    const messageText = messageElement.querySelector('span.selectable-text')?.innerText || '';
                    const messageTime = messageElement.querySelector('span[data-testid="msg-time"]')?.innerText || '';
                    return { text: messageText, time: messageTime };
                });
            });

            messages.push(...newMessages);

            await page.evaluate(() => {
                const chatContainer = document.querySelector('div[role="log"]');
                chatContainer.scrollTop = 0; // Scroll to top
            });

            await page.waitForTimeout(2000);

            const currentHeight = await page.evaluate(() => document.querySelector('div[role="log"]').scrollHeight);
            if (currentHeight === previousHeight) break;
            previousHeight = currentHeight;
        }

        console.log('Full Chat from the First Chat:');
        messages.forEach(msg => {
            console.log(`[${msg.time}] ${msg.text}`);
        });

        await browser.close();
    });

    client.initialize();
}

module.exports = fetchMessages;
