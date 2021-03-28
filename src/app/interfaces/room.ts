export interface Room {
  id: string;
  answer?: { sdp: string; type: RTCSdpType };
  offer?: { sdp: string; type: RTCSdpType };
}
