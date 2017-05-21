/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

function removeCompletionPreviousLineIndentation(originalText: string) {
    let lastNewLineIndex = originalText.lastIndexOf("\n");
    if (lastNewLineIndex == -1 || lastNewLineIndex == originalText.length-1) return originalText;

    let textAfterLastNewLine = originalText.substring(lastNewLineIndex + 1);
    if (textAfterLastNewLine.trim() != "") return originalText;

    return originalText.substring(0, lastNewLineIndex+1) + "  ";
}

function calculateCompletionItems(model : monaco.editor.IReadOnlyModel, position : monaco.IPosition) {
    let uri = "/test.raml"

    let offset = model.getOffsetAt(position);

    return RAML.Server.getConnection().getSuggestions(uri, offset).then(suggestions=>{

        let result = [];

        for (let suggestion of suggestions) {
            let text = suggestion.text || suggestion.displayText;

            text = removeCompletionPreviousLineIndentation(text);

            result.push({
                label: text,
                kind:  monaco.languages.CompletionItemKind.Text
            })
        }

        return result;
    })
}

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {

    monacoEngine.languages.registerCompletionItemProvider(languageIdentifier, {
        provideCompletionItems: function(model, position) {
            return calculateCompletionItems(model, position)
        }
    });

}