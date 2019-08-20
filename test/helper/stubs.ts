import * as sinon from 'sinon';
import { commands, window, workspace } from 'vscode';

export function createExecuteCommandStub(): sinon.SinonStub {
    return createStubObject(commands, 'executeCommand');
}

export function restoreExecuteCommand() {
    restoreObject(commands.executeCommand);
}

export function createGetConfigurationStub(): sinon.SinonStub {
    return createStubObject(workspace, 'getConfiguration');
}

export function restoreGetConfiguration() {
    restoreObject(workspace.getConfiguration);
}

export function createShowInputBoxStub(): sinon.SinonStub {
    return createStubObject(window, 'showInputBox');
}

export function restoreShowInputBox() {
    restoreObject(window.showInputBox);
}

export function createShowQuickPickStub(): sinon.SinonStub {
    return createStubObject(window, 'showQuickPick');
}

export function restoreShowQuickPick() {
    restoreObject(window.showQuickPick);
}

export function createShowInformationMessageStub(): sinon.SinonStub {
    return createStubObject(window, 'showInformationMessage');
}

export function restoreShowInformationMessage() {
    restoreObject(window.showInformationMessage);
}

export function createStubObject(handler: any, fn: string): sinon.SinonStub {
    const target = handler[fn];
    const stub: sinon.SinonStub = target && target.restore
        ? target
        : sinon.stub(handler, fn);

    return stub;
}

export function restoreObject(object: any) {
    const stub = object as sinon.SinonStub;
    if (stub && stub.restore) {
        stub.restore();
    }
}
