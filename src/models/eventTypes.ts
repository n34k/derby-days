export type DraftStatus = "NOT_STARTED" | "ONGOING" | "PAUSED" | "COMPLETE";

export type PickEvent = {
    type: "PICK_IS_IN" | "ANNOUNCE";
    pickId: string;
    pickNo: number;
    round: number;
    teamId: string;
    player: { id: string; name: string; image?: string | null; walkoutSong?: string | null };
};

export type PublicEvent =
    | {
          type: "STATE";
          status: DraftStatus;
          pickNo: number;
          teamId: string;
          deadlineAt: number;
      }
    | PickEvent
    | {
          type: "ANNOUNCE";
          pickNo: number;
          teamId: string;
          round: number;
          player: {
              id: string;
              name: string;
              image: string;
          };
      }
    | { type: "BOARD_UPDATE"; version: number }
    | { type: "UNDO"; pickNo: number; playerId: string };

export const publicChannel = (draftId: string) => `public-draft-${draftId}`;
//export const adminChannel = (draftId: string) => `admin-draft-${draftId}`; // optional private channel
