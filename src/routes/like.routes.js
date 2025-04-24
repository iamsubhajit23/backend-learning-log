import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleLikeOnVideo } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId").post(toggleLikeOnVideo);


export default router;