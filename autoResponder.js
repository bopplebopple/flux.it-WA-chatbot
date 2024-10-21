// autoResponder.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Function to handle automated responses
async function autoResponder() {
    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');

        client.on('message', message => {
            const msgContent = message.body.toLowerCase(); // Convert message to lowercase

            if (msgContent.includes('pricing')) {
                client.sendMessage(message.from, 'Thank you for your inquiry! Our pricing is competitive and varies by service. Please visit our website for more details.');
            } else if (msgContent.includes('support')) {
                client.sendMessage(message.from, 'Our support team is here to help! You can reach us at support@example.com.');
            } else if (msgContent.includes('hours')) {
                client.sendMessage(message.from, 'We are open Monday to Friday, 9 AM to 5 PM. How can we assist you today?');
            }
        });
    });

    client.initialize();
}

module.exports = autoResponder;
