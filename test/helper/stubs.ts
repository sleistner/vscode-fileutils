import * as sinon from "sinon";
import { commands, window, workspace } from "vscode";

export function createExecuteCommandStub(): sinon.SinonStub {
    return createStubObject(commands, "executeCommand");
}

export function restoreExecuteCommand(): void {
    restoreObject(commands.executeCommand);
}

export function createGetConfigurationStub(keys: { [key: string]: boolean }): sinon.SinonStub {
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

export function createShowInformationMessageStub(): sinon.SinonStub {
    return createStubObject(window, "showInformationMessage");
}

export function restoreShowInformationMessage(): void {
    restoreObject(window.showInformationMessage);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = any;

export function createStubObject(handler: Handler, functionName: string): sinon.SinonStub {
    const target: sinon.SinonStub | undefined = handler[functionName];
    const stub: sinon.SinonStub = target && target.restore ? target : sinon.stub(handler, functionName);

    return stub;
}

export function restoreObject(object: unknown): void {
    const stub = object as sinon.SinonStub;
    if (stub && stub.restore) {
        stub.restore();
    }
}
