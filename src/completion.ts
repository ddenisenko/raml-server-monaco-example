/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

/**
 * Removes indentation being automatically added from the previous line
 * @param originalText
 * @returns {string}
 */
function removeCompletionPreviousLineIndentation(originalText: string) {
    let lastNewLineIndex = originalText.lastIndexOf("\n");
    if (lastNewLineIndex == -1 || lastNewLineIndex == originalText.length-1) return originalText;

    let textAfterLastNewLine = originalText.substring(lastNewLineIndex + 1);
    if (textAfterLastNewLine.trim() != "") return originalText;

    return originalText.substring(0, lastNewLineIndex+1) + "  ";
}

/**
 * Calculates completion proposals.
 * @param model
 * @param position
 */
function calculateCompletionItems(model : monaco.editor.IReadOnlyModel, position : monaco.IPosition) {
    let uri = model.uri.toString()

    let offset = model.getOffsetAt(position);

    return RAML.Server.getConnection().getSuggestions(uri, offset).then(suggestions=>{

        let result = [];

        for (let suggestion of suggestions) {
            let text = suggestion.text || suggestion.snippet || suggestion.displayText;

            text = removeCompletionPreviousLineIndentation(text);

            if(suggestion.extra && suggestion.displayText) {
                result.push({
                    label: suggestion.displayText,
                    insertText: suggestion.extra + text,
                    kind: 1
                });
            } else {
                result.push({
                    label: text,
                    kind: 1
                });
            }
        }

        return result;
    })
}

/**
 * Initializes module.
 * @param monacoEngine
 * @param languageIdentifier
 */
export function init(monacoEngine : typeof monaco, languageIdentifier: string) {

    monacoEngine.languages.registerCompletionItemProvider(languageIdentifier, {
        provideCompletionItems: function(model, position) {
            return calculateCompletionItems(model, position)
        }
    });

}