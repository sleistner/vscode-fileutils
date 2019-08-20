import { describe } from './describe';
import { it } from './it';
import { IStep } from './types';

export const steps: { [key: string]: IStep } = {
    describe,
    it
};
