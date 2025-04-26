import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getTweetById,
  getUserAllTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-tweet").post(createTweet);

router.route("/update-tweet/:tweetId").patch(updateTweet);

router.route("/delete-tweet/:tweetId").delete(deleteTweet);

router.route("/id/:tweetId").get(getTweetById);

router.route("/").get(getUserAllTweets);

export default router;
