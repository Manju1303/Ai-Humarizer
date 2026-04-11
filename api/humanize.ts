import { humanizePipeline } from "../engine";
import { chunkText } from "../utils";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { text, tone } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const chunks = chunkText(text);
        let resultText = "";
        for (const chunk of chunks) {
            const result = await humanizePipeline(chunk, tone || 'academic');
            resultText += result.text + " ";
        }

        res.status(200).json({ text: resultText.trim() });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
