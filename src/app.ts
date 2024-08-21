import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import router from "./router";

const app: Application = express();

app.use(cors());

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App is listening on port ${port}!`);
});

app.use("/", router);

export default app;
