import OpenAI from "openai";

const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
    OPENAI_API_KEY,
    OPENAI_MODEL = "gpt-5-mini",
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
        "IT",
        "AI",
        "computer science fundamentals",
        "internet history",
        "tech history",
        "psychology",
        "brain",
        "philosophy",
        "science",
        "universe",
        "history",
        "culture",
        "ancient civilizations",
        "human evolution",
        "probability",
        "statistics intuition",
        "mental models",
        "thinking frameworks",
        "important school knowledge",
        "physics",
        "math",
        "biology",
        "logic puzzle",
        "paradox",
        "programmer brain hack"
    ];

    return topics[Math.floor(Math.random() * topics.length)];
}

async function main() {
    const topic = randomTopic();

    const prompt = `
Generate exactly one concise interesting fact, insight, or mini-lesson in Armenian.

Topic: ${topic}

Requirements:
- 4 to 7 short lines
- clear and easy to read in Telegram
- accurate
- useful for personal learning
- no markdown bold
- no hashtags
- start with a fitting emoji
- include a 1-line takeaway at the end
`.trim();

    const response = await openai.responses.create({
        model: OPENAI_MODEL,
        input: prompt,
    });

    const text = response.output_text?.trim();

    if (!text) {
        throw new Error("OpenAI returned empty text");
    }

    await sendTelegramMessage(text);
    console.log("Fact sent");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
