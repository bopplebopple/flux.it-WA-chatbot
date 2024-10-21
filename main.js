const { Client, LocalAuth } = require('whatsapp-web.js');
const qocode = require('qrcode-terminal');

// Create a new client instance with Local Authentication
const client = new Client({
    authStrategy: new LocalAuth()
});

// When the client receives a QR code, generate it in the terminal
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// When the client is ready, run this code (only once)
client.on('ready', () => {
    console.log('Client is ready!');

    client.on('message', message => {
        const msgContent = message.body.toLowerCase(); // Convert message to lowercase

        // Define automated responses based on keywords
        if (msgContent.includes('pricing')) {
            client.sendMessage(message.from, 'Thank you for your inquiry! Our pricing is competitive and varies by service. Please visit our website for more details.');
        } else if (msgContent.includes('support')) {
            client.sendMessage(message.from, 'Our support team is here to help! You can reach us at support@example.com.');
        } else if (msgContent.includes('hours')) {
            client.sendMessage(message.from, 'We are open Monday to Friday, 9 AM to 5 PM. How can we assist you today?');
        }
    });
});

// Start the WhatsApp client
client.initialize();
