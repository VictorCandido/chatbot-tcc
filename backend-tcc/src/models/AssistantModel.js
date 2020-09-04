const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();

try {
    const assistant = new AssistantV1({
        version: process.env.VERSION,
        authenticator: new IamAuthenticator({
            apikey: process.env.ASSISTANT_APIKEY
        }),
        url: process.env.URL
    });
    
    module.exports = assistant;
} catch (error) {
    console.log('[ERROR!] Fail at AssistantModel.js')
    throw error;    
}