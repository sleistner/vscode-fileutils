import { existsSync } from "fs";
import path from "path";
import { Uri, workspace } from "vscode";
import {
    editorFile1,
    editorFile2,
    fixtureFile1,
    fixtureFile2,
    tmpDir,
    workspaceFolderA,
    workspaceFolderB,
} from "./environment";
import {
    restoreExecuteCommand,
    restoreGetConfiguration,
    restoreGetWorkspaceFolder,
    restoreShowInformationMessage,
    restoreShowInputBox,
    restoreShowQuickPick,
    restoreShowWorkspaceFolderPick,
    restoreWorkspaceFolders,
} from "./stubs";

export async function beforeEach(): Promise<void> {
    if (existsSync(tmpDir.fsPath)) {
        await workspace.fs.delete(tmpDir, { recursive: true, useTrash: false });
    }
    await workspace.fs.copy(fixtureFile1, editorFile1, { overwrite: true });
    await workspace.fs.copy(fixtureFile2, editorFile2, { overwrite: true });

    await workspace.fs.createDirectory(Uri.file(path.resolve(tmpDir.fsPath, "dir-1")));
    await workspace.fs.createDirectory(Uri.file(path.resolve(tmpDir.fsPath, "dir-2")));

    await workspace.fs.createDirectory(workspaceFolderA.uri);
    await workspace.fs.createDirectory(workspaceFolderB.uri);

    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderA.uri.fsPath, "dir-1")));
    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderA.uri.fsPath, "dir-2")));

    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderB.uri.fsPath, "dir-1")));
    await workspace.fs.createDirectory(Uri.file(path.resolve(workspaceFolderB.uri.fsPath, "dir-2")));
}

export async function afterEach(): Promise<void> {
    if (existsSync(tmpDir.fsPath)) {
        await workspace.fs.delete(tmpDir, { recursive: true, useTrash: false });
    }
    restoreExecuteCommand();
    restoreGetConfiguration();
    restoreGetWorkspaceFolder();
    restoreShowInformationMessage();
    restoreShowInputBox();
    restoreShowQuickPick();
    restoreShowWorkspaceFolderPick();
    restoreWorkspaceFolders();
}
