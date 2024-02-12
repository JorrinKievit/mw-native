import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { AllSlices } from "./slices/types";
import { createInterfaceSlice } from "./slices/interface";
import { createVideoSlice } from "./slices/video";

export const usePlayerStore = create(
  immer<AllSlices>((...a) => ({
    ...createInterfaceSlice(...a),
    ...createVideoSlice(...a),
  })),
);
