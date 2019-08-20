import { use } from 'chai';
import * as mocha from 'mocha';
import * as sinonChai from 'sinon-chai';
import { steps } from './steps';

export * from './callbacks';
export * from './environment';
export * from './functions';
export * from './stubs';

use(sinonChai);

export const protocol = {
    describe(name: string, subject: any, ...rest: any): mocha.Suite {
        const step = steps.describe[name](subject, ...rest);
        return mocha.describe(name, step);
    },
    it(name: string, subject: any, ...rest: any): mocha.Test {
        const step = steps.it[name](subject, ...rest);
        return mocha.it(name, step);
    }
};
