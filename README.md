# YE YE Coffee - Lucky Draw Campaign

Premium lucky draw campaign website for **YE YE 3 in 1 Instant Coffee Mix**.

## Tech Stack

- **Frontend:** Next.js 14 App Router, Tailwind CSS, TypeScript
- **Backend:** Next.js API Routes
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (HTTP-only cookies)
- **Storage:** Cloudflare R2 (AWS S3 compatible)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and configure:

```env
MONGODB_URI=mongodb://localhost:27017/yeye-lucky-draw
JWT_SECRET=your-super-secret-jwt-key
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

> **Note:** If R2 is not configured, receipt images are stored as base64 data URLs in development.

### 3. Seed database

```bash
npm run seed
```

Creates admin user and prizes:
- **Username:** admin
- **Email:** admin@yeyecoffee.mn
- **Password:** admin123

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Campaign homepage |
| `/login` | User login |
| `/register` | User registration |
| `/upload-receipt` | Upload purchase receipt |
| `/my-receipts` | View own receipts |
| `/winners` | Public winners list |
| `/prizes` | Prize details |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/receipts` | Receipt approval |
| `/admin/winners` | Winners management |
| `/admin/lucky-wheel` | Lucky draw wheel |

## Product Images

Replace placeholder at `public/images/coffee-product.svg` with actual product photos.

## License

Private - YE YE Coffee Campaign
