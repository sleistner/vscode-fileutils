export type FuncVoid = () => void;
export interface IStep {
    [key: string]: (subject: any, ...rest: any) => FuncVoid;
}
