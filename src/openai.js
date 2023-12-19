key = "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";

const OpenAI = require("openai").OpenAI;

const ai = new OpenAI({
    apiKey: key
});


async function test() {
    for (let i = 0; i < 50; ++i) {
        const response = await ai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content: '生产出一个鼓励蓝队的消息，让他们向前冲努力打败红队。写个只有7=10个字的文案'
            },]
        });
        console.log(response.choices[0].message.content);
    }
}
