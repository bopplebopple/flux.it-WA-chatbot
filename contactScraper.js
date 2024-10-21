// scrapeContacts.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode-terminal');

// Function to scrape contacts from WhatsApp
async function scrapeContacts() {
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

        await page.click('div[title="Chat"]'); // Click contacts list
        await page.waitForSelector('div[role="row"]'); // Wait for contacts to load

        const contacts = await page.evaluate(() => {
            const contactElements = document.querySelectorAll('div[role="row"]');
            return Array.from(contactElements).map(contactElement => {
                const name = contactElement.querySelector('span[title]')?.innerText || '';
                const number = contactElement.querySelector('span[class="_2FVVk"]')?.innerText || '';
                return { name, number };
            });
        });

        console.log('Contact List:');
        contacts.forEach(contact => {
            console.log(`${contact.name}: ${contact.number}`);
        });

        await browser.close();
    });

    client.initialize();
}

module.exports = scrapeContacts;
