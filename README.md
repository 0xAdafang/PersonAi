# 🎭 PersonAi

**A local AI assistant to embody, chat with, and remember your characters.**

PersonAi is a modern, high-performance desktop application built with Tauri, TypeScript, Rust, and React. It's designed to provide an immersive character interaction experience with persistent memory and complete offline functionality.

⚠️ **Please note:** The application runs entirely offline for maximum privacy and security.  
⚠️ **This project contains only demonstration data.** No real personal information is stored or processed.

---

## 🚀 Key Features

### 🧑‍🎨 **Character & Persona Creation**
- Create fully customized characters with names, roles, and backstories
- Dynamic character management with avatar support
- Role-based persona system for varied interactions

### 💬 **Immersive AI Chat System**
- Converse with your characters in a sleek, responsive interface
- Messages stored locally with persistent memory
- Real-time conversation flow with typing indicators

### 🧠 **Context-Preserving Memory**
- Chat history saved per character/persona combination
- Automatic session restoration when resuming conversations
- JSON-based storage system for reliability

### 📚 **Recent Chat Overview**
- Sidebar displays recent sessions with avatars and names
- Full-page chat history view available
- Quick access to previous conversations

### 💡 **Role-based Messaging**
- Messages include metadata (sender role, timestamp)
- Clean parsing for better conversation flow
- User/assistant role distinction

### ⚡ **Modern Offline App**
- Built with React, TailwindCSS, and Tauri
- Fast startup and native performance
- Complete offline functionality - no external dependencies

---

## 🛠️ Tech Stack

| **Frontend** | **Backend / Software** |
|---|---|
| TypeScript | Rust (Tauri) |
| React + Vite | Go API Layer |
| TailwindCSS | Python (Flask) |
| React Router | JSON File Storage |
| Tauri API | Local LLM Integration |

### 🧩 **Tauri Commands**
- `load_recent_chats` – fetch recent sessions
- `load_chat_history` – open saved conversations  
- `delete_chat_history` – remove session history

### 💾 **Storage Architecture**
- **JSON-based flat files** (no database needed)
- `data/history/{characterId}_{personaId}.json` – per-session logs
- `recent_chats.json` – indexed summary of sessions

---

## 🖼️ Screenshots

### 🌞 **Light Theme – Dashboard**
![Dashboard Light](./images/1.)

### 🧙 **Manage Characters – Character & Persona Management**
![Manage Characters](./images/2.)

### 💬 **Chat Interface – Talk with your custom AI**
![Chat Page](./images/3.)

---

## 📦 Installation

```bash
git clone https://github.com/0xAdafang/PersonAi.git
cd PersonAi

# Install frontend dependencies
npm install

# Launch in dev mode
npm run tauri dev
```

### ⚠️ **Requirements:**
- **Rust** + **Node.js** installed locally
- **Ollama** (optional) for enhanced LLM capabilities

---

## ✨ Why PersonAi?

This project allowed me to:
- **Explore character-based AI interactions** in a desktop environment
- **Create a modern design** with React + Tailwind
- **Experiment with offline-first architectures** for privacy
- **Integrate local LLM capabilities** with persistent memory
- **Manage a complete frontend + backend project** with Tauri

### 🎯 **Perfect for:**
- **Storytelling** and creative writing
- **Self-RPG** and character simulation
- **Roleplay** scenarios and character development
- **Learning** Tauri, React, and cross-platform development

---

## 🔮 Planned Features

- 📆 **Human-friendly timestamps** (e.g., "2h ago")
- 🎭 **Character presets** with emotion and memory sliders
- 🔊 **Voice chat** with speech recognition/synthesis
- 🦙 **Enhanced LLM integration** (Ollama, llama.cpp, etc.)
- 🎨 **Theme selector** (light/dark + retro options)
- 🧙 **Prompt Wizard** for advanced character customization

---

## 🎨 Credits

- 💡 **Interface inspired by** [Tauri UI](https://github.com/agmmnn/tauri-ui) project by [@agmmnn](https://github.com/agmmnn)
- 🎨 **Color palette:** Modern dark/light theme with accent colors
- 🖼️ **Icons:** [Lucide](https://lucide.dev/)
- 📊 **Components:** Custom React components with TailwindCSS

---

## 🫶 Contributing

```bash
# Fork the repository
git clone https://github.com/your-username/PersonAi.git
cd PersonAi

# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add some amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

⭐ **Star the repo** if you like it!  
All contributions, issues, and suggestions are welcome.

---

## 📜 License

This project is open-source under **MIT License**.  
Use it, modify it, break it, rebuild it. It's yours.

---

## 👨‍💻 Author

**0xAdafang - Terence**  
📫 [adafang@proton.me](mailto:adafang@proton.me)  
🌐 [github.com/0xAdafang](https://github.com/0xAdafang)

🇨🇦 **Project developed in Montréal, Quebec** as part of ongoing exploration in AI-assisted character interaction and cross-platform desktop development.
