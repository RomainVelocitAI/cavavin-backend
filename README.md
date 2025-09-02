# Cavavin Backend API

Backend API for Cavavin e-commerce built with Express.js, Prisma, and PostgreSQL (Supabase).

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your database URL
4. Run the development server: `npm run dev`

## Deployment on Render

1. Connect your GitHub repository to Render
2. Set the environment variable `DATABASE_URL` with your Supabase connection string
3. Deploy

## API Endpoints

- `GET /health` - Health check
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `GET /api/stores` - Get all stores
- `GET /api/delivery-zones` - Get delivery zones