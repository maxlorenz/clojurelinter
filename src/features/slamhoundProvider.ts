'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import { log } from "util";

let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection();

export function fixNS(textDocument: vscode.TextDocument) {
        let options = vscode.workspace.rootPath ? { cwd: vscode.workspace.rootPath } : undefined;
        let args = ['run', '-m', 'slam.hound', textDocument.fileName];
        let childProcess = cp.spawn('lein', args, options);

        let diagnostics: vscode.Diagnostic[] = [];

        vscode.window.showInformationMessage("Running slamhound");

        if (childProcess.pid) {
            childProcess.stdout.on('data', (data) => {
                let range = new vscode.Range(0, 0, 0, 0);
                let diagnostic = new vscode.Diagnostic(range, data.toString());
                diagnostics.push(diagnostic);
            });

            childProcess.on('close', (code) => {
                if (diagnostics.length > 0) {
                    vscode.window.showErrorMessage("Slamhound failed");
                    diagnosticCollection.set(textDocument.uri, diagnostics);
                } else {
                    vscode.window.showInformationMessage("Slamhound finished");
                }
            });
        }
}