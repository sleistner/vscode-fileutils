import * as os from 'os';
import * as path from 'path';
import { Uri } from 'vscode';

export const rootDir = path.resolve(__dirname, '..', '..');
export const tmpDir = Uri.file(path.resolve(os.tmpdir(), 'vscode-fileutils-test'));

export const fixtureFile1 = Uri.file(path.resolve(rootDir, 'test', 'fixtures', 'file-1.rb'));
export const fixtureFile2 = Uri.file(path.resolve(rootDir, 'test', 'fixtures', 'file-2.rb'));

export const editorFile1 = Uri.file(path.resolve(tmpDir.fsPath, 'file-1.rb'));
export const editorFile2 = Uri.file(path.resolve(tmpDir.fsPath, 'file-2.rb'));

export const targetFile = Uri.file(path.resolve(`${editorFile1.fsPath}.tmp`));
