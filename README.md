# Nestly

Nestly is a production-ready social media platform built with Next.js 14, using the App Router, Server Components, and Server Actions to deliver high performance, scalability, and type safety. The project emphasizes real-world product engineering practices rather than demo-level implementations.

🚀 Overview

Nestly is a full-stack social networking application designed to reflect how modern product companies build and scale applications. It focuses on efficient rendering, type-safe data handling, and practical engineering trade-offs.

Built on the Next.js 14 App Router, the platform uses Server Components to reduce client-side complexity and Server Actions to handle secure, type-safe backend operations. It demonstrates scalable social features, structured data modeling, and thoughtful UI patterns to improve overall user experience.

## ✨ Key Features

* User authentication and management using **Clerk** with automatic user synchronization
* Create posts with image uploads
* Social interactions: **likes, comments, follows**
* **Optimistic UI updates** for likes and comments to provide instant feedback
* **AI-powered caption generation** using **Groq API (Llama 3.3)** 
* **Real-time notifications** with rich contextual data
* Mobile-first, fully responsive UI

---

## 🧠 Technical Highlights

* Built using **Next.js 14 App Router** for modern routing and layouts
* Extensive use of **Server Components** to reduce client bundle size
* **Server Actions** for secure, type-safe backend logic without traditional API layers
* Fully typed codebase using **TypeScript**
* **Prisma ORM** for managing complex relational data models

  * Well-defined relations
  * Unique constraints
  * Composite indexes
  * Cascade deletes to maintain data integrity
* Optimistic UI patterns to deliver instant user feedback
* Designed with scalability and maintainability in mind

---

## 🛠 Tech Stack

* **Frontend:** Next.js 14, React, TypeScript
* **Backend:** Next.js Server Actions
* **Database Layer:** Prisma ORM
* **Authentication:** Clerk
* **AI Integration:** Groq API (Llama 3.3)
* **Styling:** Tailwind CSS

---

## 📂 Project Structure

```
NESTLY/
├── .next/
├── components/
├── node_modules/
├── prisma/
├── public/
├── src/
│   ├── actions/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── middleware.ts
├── test/
├── .env
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

```

---

## ⚙️ Installation & Setup

1. Clone the repository

```bash
git clone https://github.com/Saniya1976/Nestly
cd nestly
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables
   Create a `.env` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
GROQ_API_KEY=

```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
```

6. Open in browser

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

* User authentication handled by **Clerk**
* Secure session handling across Server Components and Server Actions

---

## 📌 What This Project Demonstrates

* Building a **real-world, production-ready social platform** using modern Next.js patterns
* Writing **type-safe full-stack code** with minimal runtime errors
* Designing scalable relational data models using Prisma
* Applying optimistic UI techniques to improve perceived performance
* Integrating AI features in a controlled and product-focused manner
* Making architectural decisions similar to those made in mid-level product teams

---

## 🔮 Future Improvements

* WebSocket-based live notifications
* Advanced content moderation
* Performance monitoring and logging
* Enhanced search and discovery
* Automated testing (unit + integration)

---

## 👩‍💻 Author

**Saniya**
Full Stack Developer

---
