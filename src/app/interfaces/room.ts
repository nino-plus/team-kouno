export interface Room {
  id: string;
  ownerId: string;
  answer?: { sdp: string; type: RTCSdpType };
  offer?: { sdp: string; type: RTCSdpType };
}
