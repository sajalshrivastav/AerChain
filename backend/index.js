try {
    require('./src/index.js');
} catch (err) {
    // Provide a clear error message if startup fails here
    console.error('Failed to start server from backend/index.js:', err);
    process.exit(1);
}
