/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

import ui = require('./ui');

import * as ls from 'vscode-languageserver-types';

/**
 * Calculates definition.
 * @param model
 * @param position
 */
function calculateDefinition(model : monaco.editor.IReadOnlyModel, position: monaco.Position) :
    monaco.Thenable<monaco.languages.Location> {

    let uri = model.uri.toString()

    let offset = model.getOffsetAt(position);
    return RAML.Server.getConnection().openDeclaration(uri, offset).then((locations)=>{

        if (!locations || locations.length < 1) return null;

        let location = locations[0];
        
        let start = model.getPositionAt(location.range.start);
        let end = model.getPositionAt(location.range.end);

        ui.selectFileOrFolder(location.uri);
        ui.openInEditor(location.uri);
        
        return {
            uri: monaco.Uri.parse(location.uri),
            range: {
                startLineNumber: start.lineNumber,
                startColumn: start.column,
                endLineNumber: end.lineNumber,
                endColumn: end.column
            }
        }
    })
}

/**
 * Initializes the module.
 * @param monacoEngine
 * @param languageIdentifier
 */
export function init(monacoEngine : typeof monaco, languageIdentifier: string) {
    monacoEngine.languages.registerDefinitionProvider(languageIdentifier, {
        provideDefinition: function(model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken) {
            return calculateDefinition(model, position);
        }
    });

}