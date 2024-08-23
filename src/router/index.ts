import express from "express";
import { check } from "../controllers/check";
import authRouter from "./authRouter";
import bookRouter from "./bookRouter";
import categoryRouter from "./categoryRouter";
import circulationRouter from "./circulationRouter";

const router = express.Router();

router.get("/check", check);
router.use("/auth", authRouter);
router.use("/book", bookRouter);
router.use("/category", categoryRouter);
router.use("/circulation", circulationRouter);

export = router;
