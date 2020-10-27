import Mocha from "mocha";
import * as path from "path";
import { RelativePattern, workspace } from "vscode";

export async function run(): Promise<void> {
    const mocha = new Mocha({
        reporter: "list",
        ui: "bdd",
        color: true,
    });

    const testsRoot = path.resolve(__dirname, "..");
    const pattern = new RelativePattern(testsRoot, "**/**.test.js");
    const files = await workspace.findFiles(pattern, undefined, Number.MAX_VALUE);

    // Add files to the test suite
    files.forEach((file) => mocha.addFile(file.fsPath));

    // Run the mocha test
    return new Promise((resolve, reject) => {
        try {
            mocha.run((failures: number) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}
