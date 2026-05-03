import './config/env.js';
import { env } from './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { mongoSanitizeMiddleware } from './middleware/sanitize.js';
import { pinoHttp } from 'pino-http';
import mongoose from 'mongoose';
import { logger } from './lib/logger.js';
import authRouter from './routes/auth.js';
import adminCategoriesRouter from './routes/admin/categories.js';
import adminProductsRouter from './routes/admin/products.js';
import adminBannersRouter from './routes/admin/banners.js';
import adminImagesRouter from './routes/admin/images.js';
import adminDashboardRouter from './routes/admin/dashboard.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminUsersRouter from './routes/admin/users.js';
import catalogRouter from './routes/catalog.js';
import userRouter from './routes/user.js';
import ordersRouter from './routes/orders.js';
import couponsRouter from './routes/coupons.js';
import webhooksRouter from './routes/webhooks.js';
import { errorMiddleware } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.use(pinoHttp({
  logger,
  redact: { paths: ['req.headers.cookie', 'req.headers.authorization'], censor: '[REDACTED]' },
}));

// Webhook must be mounted BEFORE express.json() so it gets raw body for signature verification
app.use('/api/webhooks', webhooksRouter);

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/banners', adminBannersRouter);
app.use('/api/admin', adminImagesRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api', catalogRouter);
app.use('/api/user', userRouter);

app.use(errorMiddleware);

async function start() {
  await mongoose.connect(env.MONGO_URI);
  logger.info('MongoDB connected');
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
