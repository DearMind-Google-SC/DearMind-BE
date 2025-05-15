# DearMind-BE

NestJS Backend Server for **DearMind**, a digital art therapy service built for the **Google Solution Challenge 2025**.

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS Logo" />
</p>

---

## 🧠 What is DearMind?

**DearMind** is a mobile-based digital art therapy service that helps users express emotions through drawings and short journals.  
The app provides AI-powered emotion analysis, self-care activity recommendations, and personalized visual rewards based on consistent emotional journaling.

This repository contains the **NestJS backend server**, which supports:

- Emotion record management (image + diary text)
- Firebase-based user authentication
- AI-based emotional analysis & recommendations
- Calendar-based emotion tracking
- Google Places API integration (nearby mental health centers)
- AI-generated reward image handling

---

## 🛠️ Tech Stack

| Layer          | Technology |
|----------------|------------|
| Backend        | NestJS (TypeScript) |
| Authentication | Firebase Authentication |
| Database       | Firestore (Firebase) |
| File Storage   | Firebase Storage |
| AI Integration | Vertex AI (Gemini + Imagen) |
| 3rd Party API  | Google Maps / Places API |
| Deployment     | Render + GitHub Actions |
| Docs           | Swagger |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DearMind-Google-SC/DearMind-BE.git
cd DearMind-BE


### 2. Install Dependencies

```bash
npm install


### 3. Setup Environment Variables

Create a .env file in the root directory and include:

```envv
PORT=3000
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
AI_SERVER_URL=https://your-ai-server-url


### 4. Run the Server

```bash
# Development
npm run start:dev

# Production
npm run start:prod

---

## 📘 API Documentation

Once the server is running, access the API docs at:

```bash
http://localhost:3000/api

---

## 🚢 Deployment

This backend is deployed on Render, with automatic deployment triggered via GitHub Actions on push to the main branch.

---

## 👥 Contributors

- PM & Backend: Minseon Kang (강민선)

- AI, Frontend, and Design: See full team credits in the project presentation

---

## 📄 License

This project is licensed under the MIT License.
