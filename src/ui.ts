/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

import filesystem = require("./filesystem")

var editor = null;
var selected = null;

var modelUrlToModified = {}

export function init() {
    var model = getModelForFile("/test.raml")
    editor = monaco.editor.create(document.getElementById('editorContainer'), {
        model: model,
        value: getCode("/test.raml"),
        language: 'RAML',
        theme: "myCustomTheme"
    });

    refreshTree()
    selectFileOrFolder("/test.raml")
}

export function save() {
    if (!editor) return;

    var model = editor.getModel()
    if (!model) return;

    var fullPath = model.uri.toString();
    var contents = model.getValue();

    filesystem.getFileSystem().setFileContents(fullPath, contents)

    modelUrlToModified[fullPath] = false;

    refreshCurrentEditorSaveButton()
}

export function newFile() {
    var parentFullPath = selected?selected.fullPath:null;
    var newFileName = $('#dlgAddFile_name').val();

    filesystem.getFileSystem().newFile(parentFullPath, newFileName, "");

    refreshTree();

    var newFullPath = (parentFullPath?parentFullPath:"") + "/" + newFileName
    selectFileOrFolder(newFullPath)
    openInEditor(newFullPath)
}

export function newFolder() {
    var parentFullPath = selected?selected.fullPath:null;
    var newFileName = $('#dlgAddFolder_name').val();

    filesystem.getFileSystem().newFolder(parentFullPath, newFileName);

    refreshTree();

    var newFullPath = (parentFullPath?parentFullPath:"") + "/" + newFileName
    selectFileOrFolder(newFullPath)
    openInEditor(newFullPath)
}

export function remove() {
    var fullPath = selected?selected.fullPath:null;
    if (!fullPath) return;

    filesystem.getFileSystem().remove(fullPath);
    refreshTree();
}

export function selectFileOrFolder(path) {
    var tree : any = $('#tree');

    var segments = path.split("/")

    var fileName = segments[segments.length-1]

    var nodes = tree.treeview('search', [ fileName, {
        ignoreCase: false,
        exactMatch: false,
        revealResults: false,
    }]);
    tree.treeview('clearSearch');


    var pathNode = null;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].fullPath == path) {
            pathNode = nodes[i]
            break;
        }
    }

    if (!pathNode) return;

    tree.treeview('revealNode', [ pathNode, { silent: true } ]);
    tree.treeview('selectNode', [ pathNode, { silent: true } ]);

    selected = pathNode;
}

function getModelForFile(fullFilePath) {

    var modelUri = monaco.Uri.parse(fullFilePath);

    var currentModel = monaco.editor.getModel(modelUri)
    if (currentModel) return currentModel;

    if (filesystem.getFileSystem().isDirectory(fullFilePath)) return null;

    var model = monaco.editor.createModel(getCode(fullFilePath), 'RAML', fullFilePath)
    model.onDidChangeContent(function(event){
        handleModelChanged(model.uri.toString())
    })
    return model;
}

function refreshCurrentEditorSaveButton() {

    if (!editor) return;

    var model = editor.getModel();
    if (!model) return;

    var modelPath = model.uri.toString();

    if (modelUrlToModified[modelPath] === true)$('#editorSaveButton').removeClass("disabled");
    else $('#editorSaveButton').addClass("disabled");
}

function handleModelChanged(modelPath) {
    modelUrlToModified[modelPath] = true;

    refreshCurrentEditorSaveButton()
}

function getCode(fullFilePath) {
    return filesystem.getFileSystem().content(fullFilePath)
}

function refreshTree() {
    (<any>$('#tree')).treeview({
        data: getTree(),
        onNodeSelected: function(event, data) {
            openInEditor(data.fullPath)

            selected = data;

            refreshCurrentEditorSaveButton()
        }
    });
}

function openInEditor(fullPath) {
    var model = getModelForFile(fullPath);
    if (editor) {
        editor.setModel(model)
    }
}

function getTree() {

    var fileSystemJSON = filesystem.getFileSystem().toJSON();
    return [fileSystemJSON];
}

