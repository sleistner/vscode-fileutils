import * as sinon from 'sinon';
import { commands, window, workspace } from 'vscode';

export function stubExecuteCommand(returns?: any): sinon.SinonStub {
    return stubObject(commands, 'executeCommand', returns);
}

export function restoreExecuteCommand() {
    restoreObject(commands.executeCommand);
}

export function stubGetConfiguration(returns?: any): sinon.SinonStub {
    return stubObject(workspace, 'getConfiguration', returns);
}

export function restoreGetConfiguration() {
    restoreObject(workspace.getConfiguration);
}

export function stubInputBox(returns?: any): sinon.SinonStub {
    return stubObject(window, 'showInputBox', returns);
}

export function restoreInputBox() {
    restoreObject(window.showInputBox);
}

export function stubQuickPick(returns?: any): sinon.SinonStub {
    return stubObject(window, 'showQuickPick', returns);
}

export function restoreQuickPick() {
    restoreObject(window.showQuickPick);
}

export function stubInformationMessage(returns?: any): sinon.SinonStub {
    return stubObject(window, 'showInformationMessage', returns);
}

export function restoreInformationMessage() {
    restoreObject(window.showInformationMessage);
}

export function stubObject(handler: any, fn: string, returns?: any): sinon.SinonStub {
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
