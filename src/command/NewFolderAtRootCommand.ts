import { Uri } from "vscode";
import { NewFolderCommand } from "./NewFolderCommand";

export class NewFolderAtRootCommand extends NewFolderCommand {
    public async execute(uri?: Uri): Promise<void> {
        await super.execute(uri, { relativeToRoot: true });
    }
}
