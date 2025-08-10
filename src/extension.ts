import * as vscode from "vscode";
import {
    type Command,
    CopyFileNameCommand,
    DuplicateFileCommand,
    MoveFileCommand,
    NewFileCommand,
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
import { RenameFileController } from "./controller/RenameFileController";

function handleError(err: Error) {
    if (err?.message) {
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
    const copyFileNameController = new CopyFileNameController(context);
    const duplicateFileController = new DuplicateFileController(context);
    const moveFileController = new MoveFileController(context);
    const newFileController = new NewFileController(context);
    const removeFileController = new RemoveFileController(context);
    const renameFileController = new RenameFileController(context);

    register(context, new CopyFileNameCommand(copyFileNameController), "copyFileName");
    register(context, new DuplicateFileCommand(duplicateFileController), "duplicateFile");
    register(context, new MoveFileCommand(moveFileController), "moveFile");
    register(context, new NewFileCommand(newFileController, { relativeToRoot: true }), "newFileAtRoot");
    register(context, new NewFileCommand(newFileController), "newFile");
    register(context, new NewFolderCommand(newFileController, { relativeToRoot: true }), "newFolderAtRoot");
    register(context, new NewFolderCommand(newFileController), "newFolder");
    register(context, new RemoveFileCommand(removeFileController), "removeFile");
    register(context, new RenameFileCommand(renameFileController), "renameFile");
}
