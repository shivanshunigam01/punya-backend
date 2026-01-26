# Patliputra Virtual Showroom — Backend (Node + Express + MongoDB)

Implements the backend API spec you shared (Auth, Products, Leads, Finance, Used Vehicles, Media upload, Analytics, Site Settings) plus:
- **Cloudinary** for media uploads
- **Razorpay** for payments (used to pay-before-CIBIL)
- **Surepass** integration for CIBIL check (dummy-ready, real later)

## Quick Start

```bash
npm i
cp .env.example .env
# fill .env with your real values
npm run seed:admin   # creates master admin user
npm run dev
```

Server runs at: `http://localhost:5000`

## Default Admin (created by seed)
- email: `admin@patliputraautos.com`
- password: `Admin@12345` (change after login)

## Notes
- Public endpoints have **rate limiting** (Leads/Contact/CIBIL).
- Admin endpoints require `Authorization: Bearer <access_token>`.
- MongoDB collections mirror the documentation models.
- If you want, I can also generate a Postman collection from these routes.

