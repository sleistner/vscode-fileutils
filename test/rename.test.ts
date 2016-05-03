/// <reference path="../typings/tsd.d.ts" />

require('expect.js');

import * as vscode from 'vscode';
import { FileItem } from '../src/extensions/api/item';
import { FileController } from '../src/extensions/api/controller';
import * as path from 'path';
import * as fs from 'fs-extra';

const testResourcesPath = path.join(__dirname, 'test-resources');

suite('Api Controller Tests', () => {

    suite('testing rename method', () => {
        
    });
});