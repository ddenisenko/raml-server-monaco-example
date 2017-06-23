/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

// import ramlServerClient = require("raml-language-server-web")
declare let RAML : any

let modelListeners : {[url:string] : monaco.IDisposable} = {}
let uriToModel : {[url:string] : monaco.editor.IModel} = {}

/**
 * Initializes the module.
 * @param monacoEngine
 * @param languageIdentifier
 */
export function init(monacoEngine : typeof monaco, languageIdentifier: string) {

    monacoEngine.editor.onDidCreateModel((model: monaco.editor.IModel) => {

        if (model.getModeId() != languageIdentifier) return;

        modelListeners[model.uri.toString()] = model.onDidChangeContent(()=>{modelChanged(model)});

        newModel(model)
    });

    monacoEngine.editor.onWillDisposeModel((model: monaco.editor.IModel): void => {

        if (model.getModeId() != languageIdentifier) return;

        monaco.editor.setModelMarkers(model, languageIdentifier, []);

        let uriStr = model.uri.toString();
        let listener = modelListeners[uriStr];
        if (listener) {
            listener.dispose();
            delete modelListeners[uriStr];
        }

        delete uriToModel[uriStr];
    });

    RAML.Server.getConnection().onValidationReport(report=>{
        let model = uriToModel[report.pointOfViewUri]
        if (!model) return;

        let markers = report.issues.map(issue => {

            let startPosition = model.getPositionAt(issue.range.start)
            let endPosition = model.getPositionAt(issue.range.end)

            return {
                severity: issue.type == "Error"?monaco.Severity.Error:monaco.Severity.Warning,
                startLineNumber: startPosition.lineNumber,
                startColumn: startPosition.column,
                endLineNumber: endPosition.lineNumber,
                endColumn: endPosition.column,
                message: issue.text
            }

        });

        monaco.editor.setModelMarkers(model, languageIdentifier, markers);
    })
}

/**
 * Handles new model event
 * @param model
 */
function newModel(model: monaco.editor.IModel) : void {

    let uri = model.uri.toString()
    uriToModel[uri] = model;

    RAML.Server.getConnection().documentOpened({
        uri: uri,
        text: model.getValue()
    })
}

/**
 * Handles model changed event.
 * @param model
 */
function modelChanged(model: monaco.editor.IModel) : void {

    let uri = model.uri.toString()
    uriToModel[uri] = model;

    RAML.Server.getConnection().documentChanged({
        uri: uri,
        text: model.getValue()
    })
}