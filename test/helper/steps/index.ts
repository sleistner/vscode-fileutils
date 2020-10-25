import { describe } from "./describe";
import { it } from "./it";
import { Step } from "./types";

export const steps: Record<string, Step> = {
    describe,
    it,
};
