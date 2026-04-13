// This file is DEPRECATED - Express server is no longer used
// The application now runs entirely on Next.js
// All API routes are in the app/api directory
// Keep this file for reference only

/*
OLD EXPRESS SETUP (NO LONGER USED):

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { initDb } from './services/db.js';
import { startScheduler } from './services/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ... Express setup code removed ...
*/

console.warn('[DEPRECATED] server/index.js is no longer used. Application runs on Next.js.');
