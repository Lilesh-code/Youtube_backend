import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/Register").post(registerUser)
//router.route("/login").post(login)
export  default router;
