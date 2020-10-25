import { Uri } from "vscode";

export interface CommandConstructorOptions {
    relativeToRoot?: boolean;
}

export interface Command {
    execute(uri?: Uri): Promise<void>;
}
