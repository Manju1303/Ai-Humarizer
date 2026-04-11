# AI Humanizer v3.0 (Free Forever)

Transform AI-generated text and code into natural, human-like content using the power of Llama 3 via Groq Cloud.

## 🚀 Features

- **"Free Forever" Engine**: Uses Groq's LPU (Llama 3.3 70B & 8B) for lightning-fast, high-accuracy humanization.
- **Multi-Pass Refinement**: Automatically detects "AI probability" and performs recursive rewriting until the text passes detection.
- **Document Support**: One-click extraction for **PDF, DOCX, and TXT** files.
- **Chunking Logic**: Process documents of any length without serverless timeout issues.
- **Strong Mode**: Toggle high-accuracy mode for academic or complex storytelling needs.

## 🛠️ Local Setup

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Configure Environment**:
   Create a `.env` file:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run Development Server**:
   ```bash
   bun run dev
   ```

## ☁️ Deployment (One-Click)

This project is configured for **Vercel** out-of-the-box.

1. Connect this repo to Vercel.
2. Add your `GROQ_API_KEY` to the environment variables.
3. Deploy!

## 📜 License

MIT
