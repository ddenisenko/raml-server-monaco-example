import {atomUiLib as UI, atom} from "atom-web-ui";
import editorTools = require("./editor-tools");

declare var RAML: any;

function getEditorByUriOrPath(path : string) : any {
    let activeEditor = getActiveEditor();
    if (activeEditor.getPath() == path) return activeEditor;

    return null;
}

function getActiveEditor() : any {
    var activeEditor = atom.workspace.getActiveTextEditor()
    
    if(activeEditor) {
        return activeEditor
    }

    if(editorTools.aquireManager())
        return editorTools.aquireManager().getCurrentEditor()

    return null
}

export function gotoPosition(position: number): void {
    let activeEditor = getActiveEditor();
    if (!activeEditor) {
        return;
    }

    let bufferPos = activeEditor.getBuffer().positionForCharacterIndex(position);

    activeEditor.setSelectedBufferRange({start: bufferPos, end: bufferPos}, {});
}

export function applyChangedDocuments(changedDocuments : any[]) : void {

    for (let changedDocument of changedDocuments) {

        let editor = getEditorByUriOrPath(changedDocument.uri);

        let oldContents = null;
        if (editor) {
            oldContents = editor.getText();
        }

        let newText = null;
        if (changedDocument.text) {
            newText = changedDocument.text;
        } else if (changedDocument.textEdits) {
            newText = RAML.Server.textEditProcessor.applyDocumentEdits(oldContents, changedDocument.textEdits);
        } else {
            continue;
        }

        if (editor) {
            editor.getBuffer().setText(newText);
        }
    }
}