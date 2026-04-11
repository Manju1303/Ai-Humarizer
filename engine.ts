import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq() {
    if (!_groq) {
        if (!process.env.GROQ_API_KEY) {
            console.warn("GROQ_API_KEY is missing. Humanization will fail at runtime until set.");
            throw new Error("GROQ_API_KEY missing");
        }
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
}


export interface HumanizeResult {
    text: string;
    score: number;
    passes: number;
}

/**
 * Deep Rewrite logic using Llama 3 on Groq (Free Tier)
 */
export async function deepRewrite(text: string, tone: string = "academic"): Promise<string> {
    const prompt = `
Rewrite the following text to make it completely original and plagiarism-free.
Target Tone: ${tone}

Requirements:
- Preserve the exact meaning.
- Use a natural, human-like flow.
- Change sentence structure significantly (combine/split sentences).
- Replace common AI-telltale phrases with unique expressions.
- Improve clarity and depth without being robotic.
- Avoid repetitive wording.

Text to rewrite:
"${text}"
    `;

    const chatCompletion = await getGroq().chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || text;
}

/**
 * AI Probability Analysis (Detection Proxy)
 */
export async function getAIScore(text: string): Promise<number> {
    const prompt = `
Analyze the following text and give a probability score (0-100) of it being detected as "AI-Generated" or "Plagiarized".
Return ONLY the numerical score.

Text:
"${text}"
    `;

    const chatCompletion = await getGroq().chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
    });

    const result = chatCompletion.choices[0]?.message?.content || "50";
    return parseInt(result.replace(/[^0-9]/g, "")) || 50;
}

/**
 * Multi-pass refinement loop
 */
export async function humanizePipeline(text: string, tone: string): Promise<HumanizeResult> {
    let currentText = text;
    let score = await getAIScore(currentText);
    let passes = 0;
    const maxPasses = 2;

    while (score > 15 && passes < maxPasses) {
        currentText = await deepRewrite(currentText, tone);
        score = await getAIScore(currentText);
        passes++;
    }

    return {
        text: currentText,
        score,
        passes
    };
}
