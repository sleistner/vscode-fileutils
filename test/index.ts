import Mocha from "mocha";
import * as path from "path";
import * as glob from "glob";

export async function run(): Promise<void> {
    const mocha = new Mocha({
        reporter: "list",
        ui: "bdd",
        color: true,
    });

    const testsRoot = path.resolve(__dirname, "..");
    const files = glob.sync("**/**.test.js", { cwd: testsRoot });

    console.log("Number of test files to run:", files.length);
    // Add files to the test suite
    files.forEach((file) => mocha.addFile(path.resolve(testsRoot, file)));

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
