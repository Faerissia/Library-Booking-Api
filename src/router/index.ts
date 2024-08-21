import express from "express";
import { check } from "../controllers/check";
import authRouter from "./authRouter";
import bookRouter from "./bookRouter";
import categoryRouter from "./categoryRouter";

const router = express.Router();

router.get("/check", check);
router.use("/auth", authRouter);
router.use("/book", bookRouter);
router.use("/category", categoryRouter);

export = router;
