const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Function to scrape contacts from WhatsApp
async function scrapeContacts() {
    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        console.log('Client is ready!');

        // Fetch all chats (which includes contacts)
        const chats = await client.getChats();

        // Extract contact details
        const contacts = chats.map(chat => {
            return {
                name: chat.name,
                number: chat.id.user // This is the phone number
            };
        });

        console.log('Contact List:');
        contacts.forEach(contact => {
            console.log(`${contact.name}: ${contact.number}`);
        });
    });

    client.initialize();
}

module.exports = scrapeContacts;
