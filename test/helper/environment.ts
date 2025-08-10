import * as os from "os";
import * as path from "path";
import { Uri, type WorkspaceFolder } from "vscode";

export const rootDir = path.resolve(__dirname, "..", "..", "..");
export const tmpDir = Uri.file(path.resolve(os.tmpdir(), "vscode-fileutils-test"));

export const fixtureFile1 = Uri.file(path.resolve(rootDir, "test", "fixtures", "file-1.rb"));
export const fixtureFile2 = Uri.file(path.resolve(rootDir, "test", "fixtures", "file-2.rb"));

export const editorFile1 = Uri.file(path.resolve(tmpDir.fsPath, "file-1.rb"));
export const editorFile2 = Uri.file(path.resolve(tmpDir.fsPath, "file-2.rb"));

export const targetFile = Uri.file(path.resolve(`${editorFile1.fsPath}.tmp`));
export const targetFileWithDot = Uri.file(path.resolve(tmpDir.fsPath, ".eslintrc.json"));

export const workspacePathA = path.join(tmpDir.fsPath, "workspaceA");
export const workspacePathB = path.join(tmpDir.fsPath, "workspaceB");

export const workspaceFolderA: WorkspaceFolder = { uri: Uri.file(workspacePathA), name: "a", index: 0 };
export const workspaceFolderB: WorkspaceFolder = { uri: Uri.file(workspacePathB), name: "b", index: 1 };
