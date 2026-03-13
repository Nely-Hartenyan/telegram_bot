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

async function main() {
    const prompt = `
Write 1 Daily Deep Idea in Armenian for Telegram.

Rules:
- 5 to 7 short lines
- simple but smart
- include title, explanation, example, takeaway
- start with 🧠
`.trim();

    const response = await openai.responses.create({
        model: OPENAI_MODEL,
        input: prompt,
        max_output_tokens: 180
    });

    const text = response.output_text?.trim();

    if (!text) {
        throw new Error("OpenAI returned empty text");
    }

    await sendTelegramMessage(text);
    console.log("Deep idea sent");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
