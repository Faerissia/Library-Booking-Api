import express from "express";
import * as authController from "../controllers/authController";
import * as userValidator from "../validator/userValidator";
import * as tools from "../services/tools";

const router = express.Router();

router.get("/check", authController.check);
router.post(
  "/register",
  userValidator.registerValidation,
  authController.Register
);
router.post("/login", userValidator.loginValidation, authController.Login);

router.post(
  "/refresh",
  tools.refreshTokenValidate,
  authController.refreshToken
);

export = router;
