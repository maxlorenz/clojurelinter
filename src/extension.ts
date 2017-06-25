'use strict';

import * as vscode from 'vscode';
import KibitProvider from './features/kibitProvider';

export function activate(context: vscode.ExtensionContext) {
    let linter = new KibitProvider();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('clojure', linter);
}

export function deactivate() {
}