// main.js
const fetchMessages = require('./chatScraper');
const scrapeContacts = require('./contactScraper');
const autoResponder = require('./autoResponder');
const fetchMessagesFromContact = require('./chatScraper');

// Uncomment the function you want to run
// const contactName = 'kenneth';
// fetchMessagesFromContact(contactName);

scrapeContacts();

// autoResponder();
