# 🤖 AI Humanizer v3.0 (Free Forever)

> **Transform AI-robotic outputs into authentic human expression.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FManju1303%2FAi-Humarizer&env=GROQ_API_KEY)

## 🚀 The "Free Forever" Engine
This project leverages the **Groq LPU (Language Processing Unit)** to provide high-accuracy humanization without the cost of OpenAI or paid plagiarism APIs.

### ✨ Key Features
*   **🧠 Llama 3.3 70B Rewriter**: Uses the latest state-of-the-art model for structural and semantic rewriting.
*   **🔍 AI Detection Proxy**: Self-assesses text using Llama 3 8B to refine output until it passes most AI detectors.
*   **⚡ Multi-Pass Refinement**: Automatically loops up to 2 passes if the text doesn't meet the "humanity" threshold.
*   **📂 Multi-Format Extraction**: Instant extraction and processing for **PDF, DOCX, and TXT** files.
*   **🌊 Chunking Logic**: Effortlessly process 30+ pages by splitting text into manageable word-conscious segments.
*   **🎨 Premium UI**: Glassmorphic design with real-time stats, particle backgrounds, and a live progress dashboard.

---

## 🛠️ Local Installation

1.  **Extract & Install**:
    ```bash
    bun install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root:
    ```env
    GROQ_API_KEY=your_free_groq_api_key_here
    ```
    *Get your free key at [console.groq.com](https://console.groq.com/)*

3.  **Launch**:
    ```bash
    bun run dev
    ```

---

## ☁️ One-Click Deployment

This repository is pre-configured for **Vercel** serverless functions.

1.  Push this repo to your GitHub/GitLab.
2.  Import to Vercel.
3.  Add your `GROQ_API_KEY` to the Environment Variables.
4.  **Done!** Your humanizer is live on a free `.vercel.app` domain.

---

## 💻 Tech Stack
*   **Runtime**: Bun.js
*   **AI SDK**: Groq Cloud (Llama 3.3 70B & 8B)
*   **Frontend**: Vanilla JS + CSS (Liquid Glass System)
*   **File Processing**: PDF.js, Mammoth.js, PDF-Lib
*   **Icons**: Lucide React

## 📜 License
MIT License - Free to use, modify, and distribute.

## 👨‍💻 Author
Created by [Manju1303](https://github.com/Manju1303)
