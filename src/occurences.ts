/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
declare let RAML : any;

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {
    monacoEngine.languages.registerDocumentHighlightProvider(languageIdentifier, {
        provideDocumentHighlights: function(model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken) {
            RAML.Server.getConnection().documentChanged({
                uri: model.uri.toString(),
                text: model.getValue()
            });

            RAML.Server.getConnection().positionChanged(model.uri.toString(), model.getOffsetAt(position));
            
            return RAML.Server.getConnection().markOccurrences(model.uri.toString(), model.getOffsetAt(position)).then(occurences => {
                var result = occurences.map(occurence => {
                    var start = model.getPositionAt(occurence.start);
                    var end = model.getPositionAt(occurence.end);
                    
                    var range = {
                        startLineNumber: start.lineNumber,
                        startColumn: start.column,
                        endLineNumber: end.lineNumber,
                        endColumn: end.column
                    };
                    
                    return {
                        range: range
                    }
                });
                    
                return result;
            }, reject => []);
        }
    });
}