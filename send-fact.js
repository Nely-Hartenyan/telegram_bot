import OpenAI from "openai";

const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
    OPENAI_API_KEY,
    OPENAI_MODEL = "gpt-5-nano",
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !OPENAI_API_KEY) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID / OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function sendTelegramMessage(text) {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
        }),
    });

    const data = await res.json();

    if (!data.ok) {
        throw new Error(`Telegram error: ${JSON.stringify(data)}`);
    }
}

function randomTopic() {
    const topics = [
        "programming",
        "AI",
        "psychology",
        "philosophy",
        "science",
        "history",
        "space",
        "math",
        "physics",
        "biology",
        "mental models",
        "logic"
    ];

    return topics[Math.floor(Math.random() * topics.length)];
}

function extractText(response) {
    if (response.output_text && response.output_text.trim()) {
        return response.output_text.trim();
    }

    const parts = [];

    for (const item of response.output || []) {
        if (item.type === "message") {
            for (const content of item.content || []) {
                if (content.type === "output_text" && content.text) {
                    parts.push(content.text);
                }
            }
        }
    }

    return parts.join("\n").trim();
}

async function main() {
    const topic = randomTopic();

    const prompt = `
Write exactly 1 short interesting fact in Russian for Telegram.

Topic: ${topic}

Rules:
- 3 to 5 short lines
- accurate
- simple
- start with emoji
- end with: Идея: ...
- no markdown
`.trim();

    const response = await openai.responses.create({
        model: OPENAI_MODEL,
        input: prompt,
        max_output_tokens: 120,
    });

    const text = extractText(response);

    if (!text) {
        console.error("Full OpenAI response:", JSON.stringify(response, null, 2));
        throw new Error("OpenAI returned no readable text");
    }

    await sendTelegramMessage(text);
    console.log("Fact sent");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
