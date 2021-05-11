export interface Room {
  id: string;
  ownerId: string;
  answer?: { sdp: string; type: RTCSdpType };
  offer?: { sdp: string; type: RTCSdpType };
  ownerStatus?: {
    videoPublish: boolean;
    voicePublish: boolean;
  };
  guestStatus?: {
    videoPublish: boolean;
    voicePublish: boolean;
  };
}
