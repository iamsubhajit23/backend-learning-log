import { Router } from "express";
import { getVideoById, uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT)

router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
      {
        name: "videofile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
  uploadVideo
);

router.route("/:videoId").get( getVideoById);

export default router;
