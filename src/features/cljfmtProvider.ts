'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import { log } from "util";

let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection();

export function fixFmt(textDocument: vscode.TextDocument) {
        let options = vscode.workspace.rootPath ? { cwd: vscode.workspace.rootPath } : undefined;
        let args = ['cljfmt', 'fix', textDocument.fileName];
        let childProcess = cp.spawn('lein', args, options);

        let err = '';

        vscode.window.showInformationMessage("Running cljfmt");

        if (childProcess.pid) {
            childProcess.stderr.on('data', (data) => {
                err += data;
            });

            childProcess.on('close', (code) => {
                if (err != '') {
                    vscode.window.showErrorMessage(err);
                } else {
                    vscode.window.showInformationMessage("Cljfmt finished");
                }
            });
        }
}