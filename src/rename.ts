/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

import * as ls from 'vscode-languageserver-types';

// function rename(model : monaco.editor.IReadOnlyModel, position: monaco.Position,
//     newName : string) :
//     monaco.Thenable<monaco.languages.WorkspaceEdit> {
//
//     let uri = "/test.raml"
//
//     let offset = model.getOffsetAt(position);
//     return RAML.Server.getConnection().rename(uri, offset).then((changedDocuments)=>{
//
//         if (!changedDocuments || changedDocuments.length < 1) return null;
//
//         let result : monaco.languages.WorkspaceEdit = {
//             edits : []
//         }
//
//         for (let changedDocument of changedDocuments) {
//             let start = model.getPositionAt(location.range.start)
//             let end = model.getPositionAt(location.range.end)
//
//             return {
//                 uri: model.uri,
//                 range: {
//                     startLineNumber: start.lineNumber,
//                     startColumn: start.column,
//                     endLineNumber: end.lineNumber,
//                     endColumn: end.column
//                 }
//             }
//         }
//
//
//         return result;
//     })
// }

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {
    // monacoEngine.languages.registerRenameProvider(languageIdentifier, {
    //     provideRenameEdits: function(
    //         model: monaco.editor.IReadOnlyModel, position: monaco.Position,
    //         newName: string, token: monaco.CancellationToken) {
    //
    //         return rename(model, position, newName)
    //     }
    // });

}