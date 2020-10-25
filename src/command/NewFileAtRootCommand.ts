import { Uri } from "vscode";
import { NewFileCommand } from "./NewFileCommand";

export class NewFileAtRootCommand extends NewFileCommand {
    public async execute(uri?: Uri): Promise<void> {
        await super.execute(uri, { relativeToRoot: true });
    }
}
