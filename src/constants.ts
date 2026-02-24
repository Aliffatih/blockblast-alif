export const GRID_SIZE = 8;
export const CELL_SIZE = 40;

export type Shape = number[][];

export interface BlockType {
  id: string;
  shape: Shape;
  color: string;
}

export const SHAPES: Record<string, Shape> = {
  SINGLE: [[1]],
  I2: [[1, 1]],
  I3: [[1, 1, 1]],
  I4: [[1, 1, 1, 1]],
  I5: [[1, 1, 1, 1, 1]],
  L2: [
    [1, 0],
    [1, 1],
  ],
  L3: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  J3: [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  T3: [
    [1, 1, 1],
    [0, 1, 0],
  ],
  S2: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z2: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  O2: [
    [1, 1],
    [1, 1],
  ],
  O3: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
};

export const COLORS = [
  "#FF5252", // Red
  "#448AFF", // Blue
  "#4CAF50", // Green
  "#FFEB3B", // Yellow
  "#E040FB", // Purple
  "#FF9800", // Orange
  "#00BCD4", // Cyan
];

// Placeholders for User Assets
export const AUDIO_ASSETS = {
  BACKGROUND_MUSIC: "", // User can add URL here
  GAME_OVER_MUSIC: "",   // User can add URL here
  CUPU_SOUND: "",        // User can add "anda cupu" sound URL here
  CLEAR_LINE: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  PLACE_BLOCK: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3",
  START_GAME: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
};

export const IMAGE_ASSETS = {
  GAME_OVER_PHOTO: "https://picsum.photos/400/400", // User can add URL here
};
