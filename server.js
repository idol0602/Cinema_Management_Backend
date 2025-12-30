import app from "./app.js";
import { env } from "./config/env.js";
import "dotenv/config";

const PORT = env.PORT;

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is runnig on port ${PORT}`);
});
