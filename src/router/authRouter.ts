import express from "express";
import * as authController from "../controllers/authController";
import * as userValidator from "../validator/userValidator";
import * as tools from "../services/tools";

const router = express.Router();

router.get("/check", authController.check);
router.get(
  "/",
  tools.authenticate,
  tools.authorize(["admin"]),
  userValidator.userListValidation,
  authController.userList
);
router.post(
  "/register",
  userValidator.registerValidation,
  authController.Register
);

router.post("/login", userValidator.loginValidation, authController.Login);
router.post("/logout", tools.authenticate, authController.logOut);

router.put(
  "/(:user_id)",
  tools.authenticate,
  tools.authorize(["user", "admin"]),
  userValidator.editValidation,
  authController.editUser
);

router.delete(
  "/(:user_id)",
  tools.authenticate,
  tools.authorize(["admin"]),
  userValidator.deleteValidation,
  authController.deleteUser
);

router.post(
  "/refresh",
  tools.refreshTokenValidate,
  authController.refreshToken
);

export = router;
