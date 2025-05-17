import FriendRequest, { IFriendRequest, FriendRequestStatus } from '../models/friendRequest';
import { Types } from 'mongoose';

/**
 * Send a friend request
 */
export const sendRequest = async (
  requesterId: string,
  recipientId: string
): Promise<IFriendRequest> => {
  if (requesterId === recipientId) {
    throw Object.assign(new Error("Can't friend yourself"), { status: 400 });
  }

  try {
    const request = await FriendRequest.create({
      requester: new Types.ObjectId(requesterId),
      recipient: new Types.ObjectId(recipientId),
      status: FriendRequestStatus.Pending,
    });
    return request;
  } catch (err: any) {
    // Handle duplicate key error
    if (err.code === 11000) {
      throw Object.assign(
        new Error('Friend request already exists'),
        { status: 409 }
      );
    }
    // rethrow other errors
    throw err;
  }
};

/**
 * Respond to a friend request
 */
export const respondRequest = async (
  requestId: string,
  userId: string,
  accept: boolean
): Promise<IFriendRequest> => {
  const request = await FriendRequest.findById(requestId);
  if (!request) throw Object.assign(new Error('Request not found'), { status: 404 });
  // Only recipient can accept/reject
  if (request.recipient.toString() !== userId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }
  request.status = accept ? FriendRequestStatus.Accepted : FriendRequestStatus.Rejected;
  await request.save();
  return request;
};

/**
 * List incoming friend requests (received)
 */
export const listReceived = async (
  userId: string
): Promise<IFriendRequest[]> => {
  return FriendRequest.find({ recipient: userId, status: FriendRequestStatus.Pending })
    .populate('requester', 'fullName email avatar')
    .exec();
};

/**
 * List outgoing friend requests (sent)
 */
export const listSent = async (
  userId: string
): Promise<IFriendRequest[]> => {
  return FriendRequest.find({ requester: userId, status: FriendRequestStatus.Pending })
    .populate('recipient', 'fullName email avatar')
    .exec();
};


/**
 * List confirmed friends for a user
 */
export const listFriends = async (
  userId: string
): Promise<Array<{
  _id: string;
  fullName: string;
  email: string;
  avatar: string;
  since: Date;
}>> => {
  const requests = await FriendRequest.find({
    status: FriendRequestStatus.Accepted,
    $or: [
      { requester: userId },
      { recipient: userId }
    ]
  })
    .populate('requester', 'fullName email avatar')
    .populate('recipient', 'fullName email avatar')
    .exec();

  return requests.map(req => {
    const other = req.requester.id.toString() === userId ? req.recipient : req.requester;
    return {
      _id: other.id.toString ? other.id.toString() : String(other.id),
      fullName: (other as any).fullName,
      email: (other as any).email,
      avatar: (other as any).avatar,
      since: req.updatedAt,
    };
  });
};