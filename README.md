# Chatbot Application

A full-stack chatbot application built with **Vite**, **shadcn/ui**, **Tailwind CSS**, **Nhost Auth**, **Hasura GraphQL**, and **n8n + OpenRouter**.

---

## Features

- 🔐 **Authentication**: Email-based Sign Up/Sign In with Nhost Auth  
- 🗄 **Database & Permissions**:
  - `chats` and `messages` tables with Row-Level Security (RLS)  
  - Permissions scoped only to authenticated users (role: `user`)  
- 🔗 **GraphQL Only**: All frontend communication strictly via GraphQL queries, mutations, and subscriptions  
- ⚡ **Real-time Updates**: Messages and chats are updated instantly using GraphQL subscriptions  
- 🤖 **Chatbot Integration**:
  - Hasura Action `sendMessage` triggers an **n8n workflow**  
  - n8n validates chat ownership, calls **OpenRouter API**, saves response back via Hasura GraphQL, and returns the bot’s reply  
- 🌐 **Deployment**: Hosted on **Netlify**

---

## Tech Stack

- **Frontend**: Vite, React, Tailwind CSS, shadcn/ui  
- **Backend**: Hasura GraphQL + Nhost Auth  
- **Automation**: n8n  
- **AI Model**: OpenRouter (`openai/gpt-oss-20b:free`)  

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/sohit-mishra/Chatbot-Application.git
cd Chatbot-Application
```

### 2. Install Dependencies
```
npm install
```

### 3. Configure Environment Variables

Create a .env file in the root:

```
VITE_NHOST_SUBDOMAIN=
VITE_NHOST_REGION=
VITE_ADMIN_SECRET=""
VITE_OPENROUTER_API_KEY=
VITE_AI_MODEL=openai/gpt-oss-20b:free
```
### 4. Run Locally
```
npm run dev
```

## Database Schema

**chats**
```
id (uuid) PK
user_id (uuid) FK -> auth.users.id
title (text)
created_at (timestamptz)
```

messages
```
id (uuid) PK
chat_id (uuid) FK -> chats.id
user_id (uuid) FK -> auth.users.id
sender (text)  -- 'user' | 'bot'
content (text)
created_at (timestamptz)
```

## Deployment
Netlify
```
npm run build
netlify deploy --prod
```
