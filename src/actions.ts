import IActionDescriptor = monaco.editor.IActionDescriptor;
import IEditor = monaco.editor.IEditor;
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
import ICommonCodeEditor = monaco.editor.ICommonCodeEditor;
import IContextKey = monaco.editor.IContextKey;
import IIdentifiedSingleEditOperation = monaco.editor.IIdentifiedSingleEditOperation;
import IModel = monaco.editor.IModel;

declare var RAML: any;

class ActionsManager {
    private contextKeys: IContextKey<boolean>[] = [];
    
    constructor(private editor: IStandaloneCodeEditor) {

    }

    registerActions(): void {
        RAML.Server.getConnection().allAvailableActions().then(serverActions => {
            serverActions.forEach(serverAction => {
                var contextKey = this.editor.createContextKey(descriptorConditionId(serverAction.id), true);

                this.contextKeys.push(contextKey);
                
                var actionDescriptor = createActionDescriptor(serverAction);

                this.editor.addAction(actionDescriptor)
            });
        })
    }
}

export function bindActions(editor: IStandaloneCodeEditor): void {
    new ActionsManager(editor).registerActions();
}

function descriptorConditionId(id: string): string {
    return "action_" + id + "_is_enabled";
}

function createActionDescriptor(serverAction: any): IActionDescriptor {

    return {
        id: serverAction.id,

        label: serverAction.name,

        keybindings: [],

        keybindingContext: descriptorConditionId(serverAction.id),

        precondition: descriptorConditionId(serverAction.id),

        contextMenuGroupId: (serverAction.category && serverAction.category[0]) || 'navigation',

        contextMenuOrder: 100,
        
        run: (editor: ICommonCodeEditor) => {
            var model = editor.getModel();

            var documentUri = model.uri.toString();

            var position = editor.getPosition();

            var offset = model.getOffsetAt(position);
            
            var changes = RAML.Server.getConnection().executeContextAction(documentUri, serverAction, offset)
            
            changes.then((changes: any[]) => {
                if(!changes) {
                    return;
                }
                
                var operations: IIdentifiedSingleEditOperation[] = [];

                changes.forEach(changedDocument => {
                    var toAdd = createOperations(changedDocument, model);

                    operations = operations.concat(toAdd);
                });
                
                editor.executeEdits(serverAction.id, operations);
            })
        }
    }
}

function createOperations(changedDocument: any, model: IModel): IIdentifiedSingleEditOperation[] {
    if(!changedDocument.textEdits) {
        var end = model.getPositionAt(model.getValueLength());
        
        return [<IIdentifiedSingleEditOperation>{
            identifier: {major: 1, minor: 1},
            
            range: new monaco.Range(0, 0, end.lineNumber, end.column),
            
            text: changedDocument.text,
            
            forceMoveMarkers: true
        }]
    }
    
    return changedDocument.textEdits.map(textEdit => createOperation(textEdit, model));
}

function createOperation(textEdit: any, model: IModel): IIdentifiedSingleEditOperation {
    var start = model.getPositionAt(textEdit.range.start);
    var end = model.getPositionAt(textEdit.range.start);

    return {
        identifier: {major: 1, minor: 1},

        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        
        text: textEdit.text,

        forceMoveMarkers: true
    }
}