import axios from 'axios';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

app.use(morgan('dev'));

// Create a Redis client
const client = new Redis(REDIS_URL);

// Middleware for caching
const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.originalUrl;

  try {
    const data = await client.get(key);
    if (data) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  } catch (err) {
    console.error('Redis error:', err);
    next(err);
  }
};

// Example route
app.get('/users', cacheMiddleware, async (req: Request, res: Response) => {
  // Simulate a database call

  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/users'
  );
  const data = response.data;
  // Cache the response
  await client.setex(req.originalUrl, 120, JSON.stringify(data)); // cache for 1 hr

  res.json({ data });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
