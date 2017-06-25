'use strict';

import * as vscode from 'vscode';
import KibitProvider from './features/kibitProvider';
import { fixNS } from './features/slamhoundProvider';
import { fixFmt } from './features/cljfmtProvider';

export function activate(context: vscode.ExtensionContext) {
    let linter = new KibitProvider();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('clojure', linter);

    var disposable = vscode.commands.registerCommand('extension.kibit', () => {
        linter.doKibit(vscode.window.activeTextEditor.document);
    });

    var disposable = vscode.commands.registerCommand('extension.slamhound', () => {
        fixNS(vscode.window.activeTextEditor.document);
    });

    var disposable = vscode.commands.registerCommand('extension.cljfmt', () => {
        fixFmt(vscode.window.activeTextEditor.document);
    });


}

export function deactivate() {
}