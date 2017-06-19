/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

import { monarch } from './coloring';
import validation = require('./validation')
import completion = require('./completion')
import symbols = require('./symbols')
import definition = require('./definition')
import usages = require('./usages')
import rename = require('./rename')
import filesystem = require('./filesystem')

const RAML_LANGUAGE = "RAML"

declare let RAML : any

function setupGeneralProperties(monacoEngine : typeof monaco){

    monacoEngine.languages.setLanguageConfiguration(RAML_LANGUAGE, {

        comments: {
            lineComment: '#'
        },

        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
            { open: '\'', close: '\'', notIn: ['string', 'comment'] },
        ]
    });
}

function setupColoring(monacoEngine : typeof monaco) {
    monacoEngine.languages.setMonarchTokensProvider(RAML_LANGUAGE, monarch as any);
}

export function init(monacoEngine : typeof monaco) {
    if (monacoEngine.languages.getLanguages().some(x => x.id == RAML_LANGUAGE)) return;

    monacoEngine.languages.register({
        id: RAML_LANGUAGE
    });

    setupGeneralProperties(monacoEngine)

    setupColoring(monacoEngine)

    RAML.Server.launch("../node_modules/raml-language-server-browser/worker.bundle.js")

    filesystem.init(monacoEngine, RAML_LANGUAGE)

    validation.init(monacoEngine, RAML_LANGUAGE)

    completion.init(monacoEngine, RAML_LANGUAGE)

    symbols.init(monacoEngine, RAML_LANGUAGE)

    definition.init(monacoEngine, RAML_LANGUAGE)

    usages.init(monacoEngine, RAML_LANGUAGE)

    rename.init(monacoEngine, RAML_LANGUAGE)

    RAML.Server.getConnection().setLoggerConfiguration({
        allowedComponents: [
            "RenameActionModule",
            "WebServerConnection"
        ],
        maxSeverity: null,
        maxMessageLength: 5000
    })
}

/**
 * Exports current main file system as JSON.
 * @returns {FileJSON}
 */
export function getFileSystemJSON() : filesystem.FileJSON {
    return filesystem.getFileSystem().toJSON();
}

/**
 * Gets file contents by fulll path
 * @param fullFilePath
 */
export function getFileContents(fullFilePath) : string {
    return filesystem.getFileSystem().content(fullFilePath)
}

/**
 * Saves file.
 * @param fullPath
 * @param contents
 */
export function saveFile(fullPath: string, contents: string) {
    filesystem.getFileSystem().setFileContents(fullPath, contents);
}

export function newFile(parentFullPath:string, fileName:string) {
    filesystem.getFileSystem().newFile(parentFullPath, fileName, "");
}

export function newFolder(parentFullPath:string, fileName:string) {
    filesystem.getFileSystem().newFolder(parentFullPath, fileName);
}

export function isDirectory(fullPath:string) : boolean {
    return filesystem.getFileSystem().isDirectory(fullPath);
}