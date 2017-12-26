import {atom} from "atom-web-ui";

export function fromMonacoEditor(editor: monaco.editor.ICommonCodeEditor): atom.TextEditor {
    var buffer = <atom.TextBuffer><any>{
        getText: () => editor.getModel().getValue(),
        
        characterIndexForPosition: (position: {row: number, column: number}): number => editor.getModel().getOffsetAt({column: position.column, lineNumber: position.row}),
        
        onDidChange: (callback) => editor.getModel().onDidChangeContent(callback),

        positionForCharacterIndex: (offset: number) => {
            var position = editor.getModel().getPositionAt(offset);

            return {column: position.column, row: position.lineNumber}
        },
        
        setText: (text: string) => editor.setValue(text)
    };
    
    var result =  <atom.TextEditor><any>{
        getPath: () => editor.getModel().uri.toString(),
        
        getBuffer: () => buffer,
        
        getCursorBufferPosition: () => {
            var position = editor.getPosition();
            
            return {column: position.column, row: position.lineNumber}
        },
        
        getText: () => buffer.getText(),

        pane: {},

        setSelectedBufferRange: (data) => {
            var range = new monaco.Range(data.start.row, data.start.column, data.end.row, data.end.column);
            
            editor.setSelection(range);
        }
    };
    
    return result;
}