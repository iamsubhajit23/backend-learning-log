import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCommentOnVideo,
  deleteVideoComment,
  getVideoComments,
  updateVideoComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/add-comment/:videoId").post(addCommentOnVideo);

router.route("/update-comment/:commentId").patch(updateVideoComment);

router.route("/delete-comment/:commentId").delete(deleteVideoComment);

//get all comments for given video id
router.route("/all-comments/:videoId").get(getVideoComments);


export default router