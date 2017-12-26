import IActionDescriptor = monaco.editor.IActionDescriptor;
import IEditor = monaco.editor.IEditor;
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
import ICommonCodeEditor = monaco.editor.ICommonCodeEditor;
import IContextKey = monaco.editor.IContextKey;
import IIdentifiedSingleEditOperation = monaco.editor.IIdentifiedSingleEditOperation;
import IModel = monaco.editor.IModel;

declare var RAML: any;

class ActionsManager {
    private contextKeys: {[id: string]: IContextKey<boolean>} = {};

    constructor(private editor: IStandaloneCodeEditor) {
        editor.onDidChangeCursorPosition((event) => {
            var model = editor.getModel();

            var offset = model.getOffsetAt(event.position);

            Object.keys(this.contextKeys).forEach(keyId => this.contextKeys[keyId].set(false));
            
            modelChanged(model);

            RAML.Server.getConnection().calculateEditorContextActions(model.uri, offset).then(actions => {
                actions.forEach(action => this.contextKeys[action.id] && this.contextKeys[action.id].set(true));
            });
        })
    }

    registerActions(): void {
        RAML.Server.getConnection().allAvailableActions().then(serverActions => {
            serverActions.forEach(serverAction => {
                this.contextKeys[serverAction.id] = this.editor.createContextKey(descriptorConditionId(serverAction.id), true);
                
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

var allActions = [];

(<any>window).allActions = allActions;

function createActionDescriptor(serverAction: any): IActionDescriptor {
    var aid = "raml.action." + serverAction.id.replace(new RegExp(' ', 'g'), '_').toLowerCase();
    
    allActions.push({
        when: aid + '.enabled == true',
        command: aid,
        group: (serverAction.category && serverAction.category[0]) || 'navigation'
    });

    // "menus": {
    //     "editor/context": [
    //         {
    //             "when": "ramlcontext.hello == true",
    //             "command": "extension.hello",
    //             "group": "navigation"
    //         }
    //     ]
    // }

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
            
            var changes = RAML.Server.getConnection().executeContextAction(documentUri, serverAction, offset);
            
            changes.then((changes: any[]) => {
                if(!changes) {
                    return;
                }
                
                var operations: IIdentifiedSingleEditOperation[] = [];

                changes.forEach(changedDocument => {
                    var toAdd = createOperations(changedDocument, model);

                    operations = operations.concat(toAdd);
                });

                operations.forEach(operation => editor.executeEdits(serverAction.id, [operation]));
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
    var end = model.getPositionAt(textEdit.range.end);

    return {
        identifier: {major: 1, minor: 1},

        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        
        text: textEdit.text,

        forceMoveMarkers: true
    }
}

function modelChanged(model: IModel) : void {
    let uri = model.uri.toString();
    
    RAML.Server.getConnection().documentChanged({
        uri: uri,
        text: model.getValue()
    })
}