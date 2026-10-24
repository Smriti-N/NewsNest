import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NewsNest API running on http://localhost:${PORT}`);
  console.log(
    process.env.MONGO_URI
      ? 'Storage: MongoDB'
      : 'Storage: in-memory mock mode (data resets on restart)'
  );
});
