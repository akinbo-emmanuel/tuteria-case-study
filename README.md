# 📩 Tuteria Case Study

A full-stack application built with **Next.js**, **Supabase**, and **Resend** that allows users to send referral emails using a predefined template. The app is automatically deployed using **GitHub Actions** and hosted on **Vercel**.

---

## 🚀 Features

- Send referral emails via Resend
- Store referral data in Supabase
- API route built with Next.js App Router
- Responsive UI with Tailwind CSS
- Auto-deployment using GitHub Actions
- Bonus: Pre-deployment testing (Jest)

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + API)
- **Email Service**: Resend (Template-based)
- **CI/CD**: GitHub Actions + Vercel

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/skinbo-emmanuel/tuteria-case-study.git
cd tuteria-case-study
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file and add:

```env
# Email Provider Configuration
RESEND_API_KEY=your_resend_api_key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the App Locally

```bash
npm run dev
```

---

## 🧪 Run Tests

```bash
npm run test
```

---

## 📤 API Endpoint

**POST** `/api/send-mail`

### Body Parameters

```json
{
  "userFirstName": "John",
  "referredUserName": "Jane",
  "courseName": "Full Stack Web Dev",
  "currency": "USD",
  "referralAmount": "25",
  "email": "jane@example.com"
}
```

---

## 🚀 Deployment

Auto-deployed to [Vercel](https://vercel.com/) via GitHub Actions on push to `main` or PR merge.

> PR-based deployments also run automated tests before deployment.

---

## 📎 Useful Links

* 🔗 [Live App](https://tuteria-case-study.vercel.app)
* 📁 [GitHub Repo](https://github.com/skinbo-emmanuel/tuteria-case-study)
* ✅ [Latest Deployed PR](https://github.com/skinbo-emmanuel/tuteria-case-study/pull/1)

---

## 👨‍💻 Author

**Emmanuel Akinbo**
[LinkedIn](https://linkedin.com/in/emmanuel-akinbo) • [GitHub](https://github.com/akinbo-emmanuel)
