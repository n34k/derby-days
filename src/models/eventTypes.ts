export type DraftStatus = "NOT_STARTED" | "ONGOING" | "PAUSED" | "COMPLETE";

export type PublicEvent =
    | {
          type: "STATE";
          status: DraftStatus;
          pickNo: number;
          teamId: string;
          deadlineAt: number;
      }
    | {
          type: "ANNOUNCE";
          pickNo: number;
          teamId: string;
          round: number;
          player: {
              id: string;
              name: string | null;
              image?: string | null;
          };
      }
    | { type: "BOARD_UPDATE"; version: number }
    | { type: "UNDO"; pickNo: number; playerId: string };

export const publicChannel = (draftId: string) => `public-draft-${draftId}`;
//export const adminChannel = (draftId: string) => `admin-draft-${draftId}`; // optional private channel
