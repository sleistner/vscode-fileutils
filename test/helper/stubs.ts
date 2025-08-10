import * as sinon from "sinon";
import { commands, type WorkspaceFolder, window, workspace } from "vscode";

export function createGetWorkspaceFolderStub(): sinon.SinonStub {
    return createStubObject(workspace, "getWorkspaceFolder");
}

export function restoreGetWorkspaceFolder(): void {
    restoreObject(workspace.getWorkspaceFolder);
}

export function createWorkspaceFoldersStub(...workspaceFolders: WorkspaceFolder[]): sinon.SinonStub {
    return createStubObject(workspace, "workspaceFolders").get(() => workspaceFolders);
}

export function restoreWorkspaceFolders(): void {
    restoreObject(workspace.workspaceFolders);
}

export function createExecuteCommandStub(): sinon.SinonStub {
    return createStubObject(commands, "executeCommand");
}

export function restoreExecuteCommand(): void {
    restoreObject(commands.executeCommand);
}

export function createGetConfigurationStub(keys: Record<string, string | boolean>): sinon.SinonStub {
    const config = { get: (key: string) => keys[key] };
    return createStubObject(workspace, "getConfiguration").returns(config);
}

export function restoreGetConfiguration(): void {
    restoreObject(workspace.getConfiguration);
}

export function createShowInputBoxStub(): sinon.SinonStub {
    return createStubObject(window, "showInputBox");
}

export function restoreShowInputBox(): void {
    restoreObject(window.showInputBox);
}

export function createShowQuickPickStub(): sinon.SinonStub {
    return createStubObject(window, "showQuickPick");
}

export function restoreShowQuickPick(): void {
    restoreObject(window.showQuickPick);
}

export function createShowWorkspaceFolderPickStub(): sinon.SinonStub {
    return createStubObject(window, "showWorkspaceFolderPick");
}

export function restoreShowWorkspaceFolderPick(): void {
    restoreObject(window.showWorkspaceFolderPick);
}

export function createShowInformationMessageStub(): sinon.SinonStub {
    return createStubObject(window, "showInformationMessage");
}

export function restoreShowInformationMessage(): void {
    restoreObject(window.showInformationMessage);
}

// biome-ignore lint/suspicious/noExplicitAny: Handler needs to work with various VS Code API objects
type Handler = any;

export function createStubObject(handler: Handler, functionName: string): sinon.SinonStub {
    const target: sinon.SinonStub | undefined = handler[functionName];
    const stub: sinon.SinonStub = target && "restore" in target ? target : sinon.stub(handler, functionName);

    return stub;
}

export function restoreObject(object: unknown): void {
    const stub = object as sinon.SinonStub;
    if (stub?.restore) {
        stub.restore();
    }
}
