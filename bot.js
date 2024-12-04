const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Initialize WhatsApp client with local session storage
const client = new Client({
    authStrategy: new LocalAuth() // This will store session data locally, so you won't have to scan QR code every time
});

// Event when the client is ready
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

// Event when a QR code is generated (needed to authenticate the bot)
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true }); // Prints the QR code in the terminal
});

// Event when a message is received
client.on('message', async (message) => {
    const chat = await message.getChat();
    const messageContent = message.body.toLowerCase();

    // Command: !ping
    if (messageContent === '!ping') {
        message.reply('Pong!');
    }

    // Command: !hello
    else if (messageContent === '!hello') {
        message.reply('Hello! How can I assist you today?');
    }

    // Command: !time
    else if (messageContent === '!time') {
        message.reply(`The current time is: ${new Date().toLocaleTimeString()}`);
    }

    // Command: !help - Show available commands
    else if (messageContent === '!help') {
        message.reply('Here are the available commands:\n' +
                      '!ping - Responds with Pong!\n' +
                      '!hello - Greets you\n' +
                      '!time - Shows current time\n' +
                      '!download <url> - Downloads a file (audio/video/APK)');
    }

    // Command: !download <url> - Download the file from URL
    else if (messageContent.startsWith('!download ')) {
        const url = messageContent.replace('!download ', '').trim();
        if (url) {
            downloadFile(url, message);
        } else {
            message.reply('Please provide a valid URL to download.');
        }
    }
});

// Function to download a file from a URL
async function downloadFile(url, message) {
    try {
        const fileName = path.basename(url);
        const filePath = path.join(__dirname, 'downloads', fileName);
        const writer = fs.createWriteStream(filePath);

        // Axios request to download the file
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream'
        });

        // Pipe the file data into a write stream
        response.data.pipe(writer);

        // Once the download finishes
        writer.on('finish', () => {
            message.reply(`Download complete! File saved as: ${fileName}`);
        });

        // Handle errors
        writer.on('error', (err) => {
            message.reply('Error downloading the file.');
            console.error('Download error:', err);
        });
    } catch (error) {
        message.reply('Error occurred while downloading the file.');
        console.error('Error downloading file:', error);
    }
}

// Initialize the client
client.initialize();
