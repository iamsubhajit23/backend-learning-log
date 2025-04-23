import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!channelId) {
    throw new apiError(400, "Channel id is required");
  }

  const Subscribed = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (Subscribed) {
    await Subscribed.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Unsubscribed Successfully"));
  }

  const subscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  if (!subscription) {
    throw new apiError(400, "Error while subscribing to channel");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Subscribed Successfully"));
});

export { toggleSubscription };
