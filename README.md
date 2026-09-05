# ⚡️ CollabFlow AI — Real-Time Collaborative Canvas & AI Diagrammer

<div align="center">

[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-3.1_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker Compose](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)
[![License MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>High-performance, multiplayer real-time whiteboard platform featuring sub-20ms live cursors, sticky notes, freehand drawing, and natural-language Architecture Diagram Generator powered by Google Gemini AI.</b>
</p>

</div>

---

## ✨ Core Capabilities

- 👥 **Multiplayer Live Collaboration:** Real-time remote cursors, shapes, and notes synchronization via WebSockets.
- 🤖 **Gemini AI Diagram Generator:** Type natural language (e.g. *"Microservices architecture with Kafka, Redis, and Postgres"*) to generate interactive nodes and connector arrows directly on canvas.
- 🎨 **Creative Tools:** Select, Move, Rectangles, Circles, Arrows, Sticky Notes, Freehand Brush, Custom Color Palette.
- 💾 **Instant Export & Sharing:** Export canvas to PNG image and share instant invite room links (`/room/[roomId]`).
- 🐳 **Docker-First Architecture:** 1-command startup (`docker compose up`) orchestrating Next.js frontend and WebSocket server.

---

## 🚀 Quick Start (Running Locally)

### 1-Usul: Docker orqali (Tavsiya etiladi ⭐️)

```bash
git clone https://github.com/salomh46-rgb/collabflow-ai-canvas.git
cd collabflow-ai-canvas
docker compose up -d --build
```
- 🌐 **Frontend Whiteboard:** `http://localhost:3000`
- ⚡️ **WebSocket Server:** `http://localhost:4000`

---

### 2-Usul: Qo'lda Ishga Tushirish (Manual Setup)

```bash
# 1. Serverni ishga tushirish
cd server
npm install
npm run dev

# 2. Yangi terminalda Clientni ishga tushirish
cd ../client
npm install
npm run dev
```

---

## 👨‍💻 Author & Maintainer
- **Created by:** [Jasper](https://github.com/salomh46-rgb)
- **Portfolio:** [bestportfoliyo-o4z2.vercel.app](https://bestportfoliyo-o4z2.vercel.app/)
- **Repository:** [https://github.com/salomh46-rgb/collabflow-ai-canvas](https://github.com/salomh46-rgb/collabflow-ai-canvas)
- **License:** MIT License

---

<div align="center">
  <b>⭐️ If you love this project, don't forget to leave a Star on GitHub!</b>
</div>
