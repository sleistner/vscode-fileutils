import { use } from "chai";
import * as mocha from "mocha";
import sinonChai from "sinon-chai";
import type { Command } from "../../src/command";
import { steps } from "./steps";
import type { Rest } from "./steps/types";

export * from "./callbacks";
export * from "./environment";
export * from "./functions";
export * from "./stubs";

use(sinonChai);

export const protocol = {
    describe(name: string, subject: Command, ...rest: Rest): mocha.Suite {
        const step = steps.describe[name](subject, ...rest);
        return mocha.describe(name, step);
    },
    it(name: string, subject: Command, ...rest: Rest): mocha.Test {
        const step = steps.it[name](subject, ...rest);
        return mocha.it(name, step);
    },
};

export const quickPick = {
    typeahead: {
        items: {
            workspace: [
                { description: "- workspace root", label: "/" },
                { description: undefined, label: "/dir-1" },
                { description: undefined, label: "/dir-2" },
            ],
            currentFile: [
                { description: "- current file", label: "/" },
                { description: undefined, label: "/dir-1" },
                { description: undefined, label: "/dir-2" },
                { description: undefined, label: "/workspaceA" },
                { description: undefined, label: "/workspaceA/dir-1" },
                { description: undefined, label: "/workspaceA/dir-2" },
                { description: undefined, label: "/workspaceB" },
                { description: undefined, label: "/workspaceB/dir-1" },
                { description: undefined, label: "/workspaceB/dir-2" },
            ],
        },
        options: {
            placeHolder:
                "First, select an existing path to create relative to (larger projects may take a moment to load)",
            ignoreFocusOut: true,
        },
    },
};
