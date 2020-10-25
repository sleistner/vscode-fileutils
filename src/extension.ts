import * as vscode from "vscode";
import {
    CopyFileNameCommand,
    DuplicateFileCommand,
    Command,
    MoveFileCommand,
    NewFileAtRootCommand,
    NewFileCommand,
    NewFolderAtRootCommand,
    NewFolderCommand,
    RemoveFileCommand,
    RenameFileCommand,
} from "./command";
import {
    CopyFileNameController,
    DuplicateFileController,
    MoveFileController,
    NewFileController,
    RemoveFileController,
} from "./controller";

function handleError(err: Error) {
    if (err && err.message) {
        vscode.window.showErrorMessage(err.message);
    }
    return err;
}

function register(context: vscode.ExtensionContext, command: Command, commandName: string) {
    const proxy = (...args: never[]) => command.execute(...args).catch(handleError);
    const disposable = vscode.commands.registerCommand(`fileutils.${commandName}`, proxy);

    context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext): void {
    const moveFileController = new MoveFileController(context);
    const newFileController = new NewFileController(context);
    const duplicateFileController = new DuplicateFileController(context);
    const removeFileController = new RemoveFileController(context);
    const copyFileNameController = new CopyFileNameController(context);

    register(context, new MoveFileCommand(moveFileController), "moveFile");
    register(context, new RenameFileCommand(moveFileController), "renameFile");
    register(context, new DuplicateFileCommand(duplicateFileController), "duplicateFile");
    register(context, new RemoveFileCommand(removeFileController), "removeFile");
    register(context, new NewFileCommand(newFileController), "newFile");
    register(context, new NewFileAtRootCommand(newFileController), "newFileAtRoot");
    register(context, new NewFolderCommand(newFileController), "newFolder");
    register(context, new NewFolderAtRootCommand(newFileController), "newFolderAtRoot");
    register(context, new CopyFileNameCommand(copyFileNameController), "copyFileName");
}
