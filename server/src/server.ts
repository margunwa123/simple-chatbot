import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import messageRouter from "./routes/messages";
import saveUserRouter from "./routes/save-user";
import setUserRouter from "./routes/set-user";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/messages", messageRouter);
app.use("/save-user", saveUserRouter);
app.use("/set-user", setUserRouter);

app.listen(PORT, () => {
  console.log(`app started on http://localhost:${PORT}`);
});
