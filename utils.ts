/**
 * Splits text into chunks of approximately maxWords
 * Ensuring we don't split in the middle of a sentence.
 */
export function chunkText(text: string, maxWords: number = 700): string[] {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return [text];

    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentCount = 0;

    for (const word of words) {
        currentChunk.push(word);
        currentCount++;

        if (currentCount >= maxWords && (word.endsWith('.') || word.endsWith('!') || word.endsWith('?'))) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
            currentCount = 0;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
}
