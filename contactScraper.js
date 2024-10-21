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

    // Launch Puppeteer to scrape contacts
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Go to WhatsApp Web
    await page.goto('https://web.whatsapp.com');

    // Wait for the main chat view to load
    await page.waitForSelector('._1JNuk');

    // Click on the contacts list
    await page.click('div[title="Chat"]');

    // Wait for contacts to load
    await page.waitForSelector('div[role="row"]');

    // Scrape contacts
    const contacts = await page.evaluate(() => {
        const contactElements = document.querySelectorAll('div[role="row"]');
        const contactList = [];
        contactElements.forEach(contactElement => {
            const name = contactElement.querySelector('span[title]')?.innerText || '';
            const number = contactElement.querySelector('span[class="_2FVVk"]')?.innerText || '';
            contactList.push({ name, number });
        });
        return contactList;
    });

    // Output the fetched contacts
    console.log('Contact List:');
    contacts.forEach(contact => {
        console.log(`${contact.name}: ${contact.number}`);
    });

    await browser.close();
});

// Start the WhatsApp client
client.initialize();
