import * as sinon from 'sinon';
import { commands, window, workspace } from 'vscode';

export function createExecuteCommandStub(returns?: any): sinon.SinonStub {
    return createStubObject(commands, 'executeCommand', returns);
}

export function restoreExecuteCommand() {
    restoreObject(commands.executeCommand);
}

export function createGetConfigurationStub(returns?: any): sinon.SinonStub {
    return createStubObject(workspace, 'getConfiguration', returns);
}

export function restoreGetConfiguration() {
    restoreObject(workspace.getConfiguration);
}

export function createShowInputBoxStub(returns?: any): sinon.SinonStub {
    return createStubObject(window, 'showInputBox', returns);
}

export function restoreShowInputBox() {
    restoreObject(window.showInputBox);
}

export function createShowQuickPickStub(returns?: any): sinon.SinonStub {
    return createStubObject(window, 'showQuickPick', returns);
}

export function restoreShowQuickPick() {
    restoreObject(window.showQuickPick);
}

export function createShowInformationMessageStub(returns?: any): sinon.SinonStub {
    return createStubObject(window, 'showInformationMessage', returns);
}

export function restoreShowInformationMessage() {
    restoreObject(window.showInformationMessage);
}

export function createStubObject(handler: any, fn: string, returns?: any): sinon.SinonStub {
    const target = handler[fn];
    const stub: sinon.SinonStub = target && target.restore
        ? target
        : sinon.stub(handler, fn);

    if (returns) {
        stub.returns(returns);
    }
    return stub;
}

export function restoreObject(object: any) {
    const stub = object as sinon.SinonStub;
    if (stub && stub.restore) {
        stub.restore();
    }
}
