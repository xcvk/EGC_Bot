const {AIKEY} = require("../config.json");

const OpenAI = require("openai").OpenAI;



async function GPTContent(message) {
   const ai = new OpenAI({
        apiKey: AIKEY
    });

    const response = await ai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'system',
            content: message
        }]
    });
    return response.choices[0].message.content;
}

module.exports = GPTContent;