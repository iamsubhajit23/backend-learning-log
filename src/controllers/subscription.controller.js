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

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new apiError(400, "Channel id is required");
  }

  const totalSubscriber = await Subscription.countDocuments({
    channel: channelId,
  }); // return only numbers

  if (!totalSubscriber) {
    throw new apiError(404, "Not found any subscriber for this channel");
  }

  // const subscribers = await Subscription.find(
  //   {channel: channelId}
  // ).populate("subscriber", "fullname email", )

  // if (!subscribers.length) {
  //   throw new apiError(404, "Not found any subscriber for this channel")
  // }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        // totalSubscriber: subscribers.length,
        totalSubscriber,
      },
      "Subscriber count fetched Successfully"
    )
  );
});

const getSubscribedChannel = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;

  if (!subscriberId) {
    throw new apiError(400, "Subscriber id is required");
  }

  const channel = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "fullname username");

  if (!channel.length) {
    throw new apiError(404, "Not found any subscribed channel");
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalSubscribedChannel: channel.length,
        subscribedChannel: channel,
      },
      "Subscribed channel fetched Successfully"
    )
  );
});

export { 
  toggleSubscription, 
  getUserChannelSubscribers, 
  getSubscribedChannel,

};
