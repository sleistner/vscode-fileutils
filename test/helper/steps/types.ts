import { Command } from "../../../src/command";

export type FuncVoid = () => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rest = any;
export interface Step {
    [key: string]: (subject: Command, ...rest: Rest) => FuncVoid;
}
