const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios'); // Import axios to fetch the image
const path = require('path'); // If you need to handle files locally

// Object to track which chats have already received a response
const respondedChats = new Set();
const userResponses = {}; // Track specific responses for each chatId
let automatedRepliesEnabled = true; // Flag to enable or disable automated replies

// Response options for the first level
const mainResponseOptions = {
    '1': '🎯 *You selected "What services we provide".*\nPlease choose one of the following services:\n\n1️⃣  *Web Development*\n2️⃣  *SEO Services*\n3️⃣  *Custom Solutions*\n\n🔄 0: Return to main menu.',
    '2': '💵 *Our price list is as follows:*\n\n- 🖥️ *Basic Website*: $500\n- 🛒 *E-commerce*: $1000\n- 🔧 *Custom Solutions*: Varies depending on complexity\n\n🔄 0: Return to main menu.',
    '3': '⏳ *Our timeline for a standard website is around 2-4 weeks.*\n\n🔄 0: Return to main menu.',
    '4': '🌐 *We build custom websites using modern technologies* like HTML, CSS, JavaScript, and frameworks such as React or WordPress.\n\n🔄 0: Return to main menu.',
    '5': '📞 *You selected to contact the admin.* Automated replies are now turned off for the rest of the day. An admin will reach out to you shortly.'
};

// Response options for the services (triggered by selecting '1')
const serviceResponseOptions = {
    '1': '💻 *Our web development services* include creating custom websites, web applications, and e-commerce platforms tailored to your needs.\n\n🔄 0: Return to main menu.',
    '2': '📈 *Our SEO services* focus on improving your website’s search engine ranking to drive more organic traffic and increase visibility.\n\n🔄 0: Return to main menu.',
    '3': '⚙️ *We offer custom solutions* tailored to your business, such as CRM systems, automated workflows, and more advanced needs.\n\n🔄 0: Return to main menu.'
};

// Function to handle automated responses
async function autoResponder() {
    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');

        client.on('message', async (message) => {
            console.log('Received message:', message.body); // Log received messages
            const chatId = message.from; // Get the chat ID
            const messageContent = message.body.trim(); // Clean up the message content

            // If automated replies are disabled, do not process any more messages
            if (!automatedRepliesEnabled) {
                console.log('Automated replies are turned off for the day.');
                return;
            }

            // Check if the user wants to return to the main menu
            if (messageContent === '0') {
                const mainMenuMessage = '✨ *Thank you for choosing Flux.IT!* ✨\n\nPlease reply with the number you\'d like to know about:\n\n1️⃣  *Our Services*\n2️⃣  *Price List*\n3️⃣  *Timeline*\n4️⃣  *Website*\n5️⃣  *Contact Admin*\n\n🔄 0: Return to main menu.';

                try {
                    await client.sendMessage(chatId, mainMenuMessage); // Send the main menu message
                    userResponses[chatId] = { level: 'main' }; // Reset user state
                } catch (error) {
                    console.error('Error sending main menu message:', error);
                }
                return; // Stop further processing after returning to the main menu
            }

            // Handle first-time responses
            if (!respondedChats.has(chatId)) {
                const plainMessage = '✨ *Thank you for choosing Flux.IT!* ✨\n\nPlease reply with the number you\'d like to know about:\n\n1️⃣  *Our Services*\n2️⃣  *Price List*\n3️⃣  *Timeline*\n4️⃣  *Website*\n5️⃣  *Contact Admin*\n\n🔄 0: Return to main menu.';

                try {
                    await client.sendMessage(chatId, plainMessage); // Send plain text message
                    respondedChats.add(chatId); // Mark this chat as responded
                    userResponses[chatId] = { level: 'main' }; // Initialize user responses with level 'main'
                } catch (error) {
                    console.error('Error sending plain text message:', error);
                }
            } else {
                // Handle user response based on their interaction level
                const userState = userResponses[chatId] || { level: 'main' }; // Default to 'main' level if undefined

                if (userState.level === 'main') {
                    // Handle main menu options
                    if (messageContent === '5') {
                        try {
                            // Notify the user and turn off automated replies
                            await client.sendMessage(chatId, mainResponseOptions['5']);
                            automatedRepliesEnabled = false; // Disable automated replies for the rest of the day
                        } catch (error) {
                            console.error('Error turning off automated replies:', error);
                        }
                    } else if (messageContent === '3') {
                        try {
                            // Fetch the image using axios
                            const response = await axios.get('https://i.imgur.com/rBbjJmM.png', { responseType: 'arraybuffer' });
                            const imageBuffer = Buffer.from(response.data, 'binary');

                            // Create MessageMedia from the fetched image buffer
                            const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));

                            // Send the image
                            await client.sendMessage(chatId, media);

                            // Send the timeline response along with an option to return to the main menu
                            const timelineMessage = '⏳ *Our timeline for a standard website is around 2-4 weeks.*\n\n🔄 0: Return to main menu.';
                            await client.sendMessage(chatId, timelineMessage);

                        } catch (error) {
                            console.error('Error sending timeline response or image:', error);
                        }
                    } else if (mainResponseOptions[messageContent]) {
                        try {
                            await client.sendMessage(chatId, mainResponseOptions[messageContent]); // Send main response

                            // If they selected '1', move them to the services sub-menu
                            if (messageContent === '1') {
                                userState.level = 'services'; // Move to services level
                            }
                        } catch (error) {
                            console.error('Error sending main response:', error);
                        }
                    } else {
                        try {
                            await client.sendMessage(chatId, 'Invalid input. Please reply with a number between 1 and 5.\n\n0: Return to main menu.'); // Invalid input message
                        } catch (error) {
                            console.error('Error sending invalid input message:', error);
                        }
                    }
                } else if (userState.level === 'services') {
                    // Handle service-specific options (if user is in the services sub-menu)
                    if (serviceResponseOptions[messageContent]) {
                        try {
                            await client.sendMessage(chatId, serviceResponseOptions[messageContent]); // Send service-specific response
                        } catch (error) {
                            console.error('Error sending service response:', error);
                        }
                    } else {
                        try {
                            await client.sendMessage(chatId, 'Invalid input. Please reply with a number between 1 and 3.\n\n0: Return to main menu.'); // Invalid input for services menu
                        } catch (error) {
                            console.error('Error sending invalid service input message:', error);
                        }
                    }
                }
            }
        });
    });

    client.initialize();
}

module.exports = autoResponder;
