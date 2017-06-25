'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import * as parser from './kibitParser';
import * as vscode from 'vscode';
import { log } from "util";

export default class KibitProvider {

    private diagnosticCollection: vscode.DiagnosticCollection;

    public doKibit(textDocument: vscode.TextDocument) {
        log("TRIGGERED");

        if (textDocument.languageId !== 'clojure') {
            return;
        }

        let decoded = '';
        let diagnostics: vscode.Diagnostic[] = [];

        let options = vscode.workspace.rootPath ? { cwd: vscode.workspace.rootPath } : undefined;
        let args = ['kibit', textDocument.fileName];

        let childProcess = cp.spawn('lein', args, options);

        if (childProcess.pid) {
            childProcess.stdout.on('data', (data: Buffer) => {
                decoded += data;
            });

            childProcess.stdout.on('end', () => {
                let suggestions: parser.KibitSuggestion[] = parser.parse(decoded);

                suggestions.forEach(suggestion => {
                    log("Line: " + suggestion.line);
                    log(suggestion.suggestion);
                    let range = new vscode.Range(suggestion.line, 0, suggestion.line, 0);
                    let diagnostic = new vscode.Diagnostic(range, suggestion.suggestion, vscode.DiagnosticSeverity.Hint);
                    diagnostics.push(diagnostic);
                });

                this.diagnosticCollection.set(textDocument.uri, diagnostics);
                vscode.window.showInformationMessage(
                    "Found " + diagnostics.length + " issues.");
            });
        }
    }

    private static commandId: string = 'clojure.kibit.runCodeAction';

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
        let diagnostic: vscode.Diagnostic = context.diagnostics[0];
        return [{
            title: "Accept kibit suggestion",
            command: KibitProvider.commandId,
            arguments: [document, diagnostic.range, diagnostic.message]
        }];
    }

    private runCodeAction(document: vscode.TextDocument, range: vscode.Range, message: string): any {
        vscode.window.showErrorMessage("Not yet implemented");
    }

    private command: vscode.Disposable;

    public activate(subscriptions: vscode.Disposable[]) {
        this.command = vscode.commands.registerCommand(KibitProvider.commandId, this.runCodeAction, this);
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();

        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);

        vscode.workspace.onDidOpenTextDocument(this.doKibit, this, subscriptions);

        vscode.workspace.onDidSaveTextDocument(this.doKibit, this);
    }

    public dispose(): void {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.command.dispose();
    }
}