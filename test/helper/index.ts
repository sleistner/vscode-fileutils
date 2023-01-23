import { use } from "chai";
import * as mocha from "mocha";
import sinonChai from "sinon-chai";
import { Command } from "../../src/command";
import { steps } from "./steps";
import { Rest } from "./steps/types";

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
        placeHolder: "First, select an existing path to create relative to (larger projects may take a moment to load)",
    },
};
