/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

import * as ls from 'vscode-languageserver-types';

/**
 * Calculates usages by position.
 * @param model
 * @param position
 */
function calculateUsages(model : monaco.editor.IReadOnlyModel, position: monaco.Position) :
    monaco.Thenable<monaco.languages.Location[]> {

    let uri = model.uri.toString()

    let offset = model.getOffsetAt(position);
    return RAML.Server.getConnection().findReferences(uri, offset).then((locations:any[])=>{

        let result : monaco.languages.Location[] = []

        if (!locations || locations.length < 1) return result;

        for (let location of locations) {
            let start = model.getPositionAt(location.range.start)
            let end = model.getPositionAt(location.range.end)

            result.push({
                uri: model.uri,
                range: {
                    startLineNumber: start.lineNumber,
                    startColumn: start.column,
                    endLineNumber: end.lineNumber,
                    endColumn: end.column
                }
            })
        }

        return result;
    })
}

/**
 * Initializes the module.
 * @param monacoEngine
 * @param languageIdentifier
 */
export function init(monacoEngine : typeof monaco, languageIdentifier: string) {
    monacoEngine.languages.registerReferenceProvider(languageIdentifier, {
        provideReferences: function(
            model: monaco.editor.IReadOnlyModel, position: monaco.Position,
            context: monaco.languages.ReferenceContext,
            token: monaco.CancellationToken) {

            return calculateUsages(model, position)
        }
    });

}