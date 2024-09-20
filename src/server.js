const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

const PORT = process.env.PORT || 3000; // Default to 3000 for local development, use Heroku's PORT in production

app.use(cors());
app.use(express.json());

// Main API route for login and sheets data
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
