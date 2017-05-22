/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

import * as ls from 'vscode-languageserver-types';

function rename(model : monaco.editor.IReadOnlyModel, position: monaco.Position,
    newName : string) : monaco.Thenable<monaco.languages.WorkspaceEdit> {

    let uri = "/test.raml"

    let offset = model.getOffsetAt(position);
    return RAML.Server.getConnection().rename(uri, offset, newName).then((changedDocuments)=>{

        if (!changedDocuments || changedDocuments.length < 1) return null;

        let result : monaco.languages.WorkspaceEdit = {
            edits : []
        }

        for (let changedDocument of changedDocuments) {

            if (changedDocument.text !== null) {
                let fullModelRange = model.getFullModelRange();

                let resourceEdit : monaco.languages.IResourceEdit = {
                    resource: model.uri,
                    newText: changedDocument.text,
                    range: {
                        startLineNumber: fullModelRange.startLineNumber,
                        startColumn: fullModelRange.startColumn,
                        endLineNumber: fullModelRange.endLineNumber,
                        endColumn: fullModelRange.endColumn
                    }
                }

                result.edits.push(resourceEdit);
            } else if (changedDocument.textEdits){

                for (let textEdit of changedDocument.textEdits) {
                    let serverRange = textEdit.range;

                    let start = model.getPositionAt(serverRange.start)
                    let end = model.getPositionAt(serverRange.end)

                    let modelRange = {
                        startLineNumber: start.lineNumber,
                        startColumn: start.column,
                        endLineNumber: end.lineNumber,
                        endColumn: end.column
                    }

                    let resourceEdit : monaco.languages.IResourceEdit = {
                        resource: model.uri,
                        newText: textEdit.text,
                        range: modelRange
                    }

                    result.edits.push(resourceEdit);
                }
            }
        }


        return result;
    })
}

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {
    monacoEngine.languages.registerRenameProvider(languageIdentifier, {
        provideRenameEdits: function(
            model: monaco.editor.IReadOnlyModel, position: monaco.Position,
            newName: string, token: monaco.CancellationToken) {

            return rename(model, position, newName)
        }
    });

}