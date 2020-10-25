import { Uri } from "vscode";

export interface Command {
    execute(uri?: Uri): Promise<void>;
}
