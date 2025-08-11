import { use } from "chai";
import sinonChai from "sinon-chai";

export * from "./callbacks";
export * from "./environment";
export * from "./functions";
export * from "./stubs";

use(sinonChai);

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
