import app from './src/api.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Supabase URL: ${process.env.SUPABASE_URL ? 'Set' : 'Not Set'}`);
    console.log('--- LOCAL DEV MODE ---');
});
