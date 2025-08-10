import type { Command } from "../../../src/command";

export type FuncVoid = () => void;
// biome-ignore lint/suspicious/noExplicitAny: Test framework needs flexible parameter types
export type Rest = any;
export interface Step {
    [key: string]: (subject: Command, ...rest: Rest[]) => FuncVoid;
}
