
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// DEBUG: Log all requests
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.get('/test', (req, res) => res.send('Server is alive'));

// Legacy static files (if needed to coexist)
// Legacy static files (if needed to coexist)
// Vercel robust path
app.use(express.static(path.join(process.cwd(), 'public')));

// Admin API Routes
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Delight Services Admin API Running');
});

console.log('--- ADMIN ROUTES MOUNTING ---');
console.log('Mounting /api/admin...');
app.use('/api/admin', adminRoutes);
console.log('Admin Routes Mounted');

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
