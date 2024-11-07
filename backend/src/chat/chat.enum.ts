export enum ChatRoomEnum {
  AddedToRoom,
  AlreadyInRoom,
  Banned,
  NotInvited,
  WrongPass
}

export enum ChannelType {
  Private,
  Protected,
  Public
}

export enum ActionType {
  Profile = 0,
  Invite,
  Ignore,
  Kick,
  Mute,
  Unmute,
  Ban,
  Promote,
  Demote,
  AddFriend,
  RemoveFriend,
  RemoveBlock
}
