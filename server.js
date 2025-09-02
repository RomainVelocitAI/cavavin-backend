const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://cavavin-ecommerce.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all products with filters
app.get('/api/products', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const category = req.query.category;
    const sort = req.query.sort || 'newest';
    const search = req.query.search;
    const featured = req.query.featured;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (category) {
      where.category = {
        slug: category
      };
    }
    
    if (featured === 'true') {
      where.featured = true;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { grapeVariety: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Determine sort order
    let orderBy = {};
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true
        }
      }),
      prisma.product.count({ where })
    ]);
    
    // Format products
    const formattedProducts = products.map(product => ({
      ...product,
      images: JSON.parse(product.images)
    }));
    
    res.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Error fetching products',
      message: error.message
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      ...product,
      images: JSON.parse(product.images)
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Error fetching product',
      message: error.message
    });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Error fetching categories',
      message: error.message
    });
  }
});

// Get stores
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await prisma.store.findMany();
    
    const formattedStores = stores.map(store => ({
      ...store,
      openingHours: JSON.parse(store.openingHours)
    }));
    
    res.json(formattedStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      error: 'Error fetching stores',
      message: error.message
    });
  }
});

// Get delivery zones
app.get('/api/delivery-zones', async (req, res) => {
  try {
    const zones = await prisma.deliveryZone.findMany();
    
    const formattedZones = zones.map(zone => ({
      ...zone,
      postalCodes: JSON.parse(zone.postalCodes)
    }));
    
    res.json(formattedZones);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({
      error: 'Error fetching delivery zones',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Database URL configured:', !!process.env.DATABASE_URL);
});