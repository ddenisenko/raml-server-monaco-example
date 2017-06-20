(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Editor"] = factory();
	else
		root["RAML"] = root["RAML"] || {}, root["RAML"]["Editor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var coloring_1 = __webpack_require__(1);
	var validation = __webpack_require__(2);
	var completion = __webpack_require__(3);
	var symbols = __webpack_require__(4);
	var definition = __webpack_require__(5);
	var usages = __webpack_require__(6);
	var rename = __webpack_require__(7);
	var filesystem = __webpack_require__(8);
	var RAML_LANGUAGE = "RAML";
	function setupGeneralProperties(monacoEngine) {
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
	function setupColoring(monacoEngine) {
	    monacoEngine.languages.setMonarchTokensProvider(RAML_LANGUAGE, coloring_1.monarch);
	}
	function init(monacoEngine) {
	    if (monacoEngine.languages.getLanguages().some(function (x) { return x.id == RAML_LANGUAGE; }))
	        return;
	    monacoEngine.languages.register({
	        id: RAML_LANGUAGE
	    });
	    setupGeneralProperties(monacoEngine);
	    setupColoring(monacoEngine);
	    RAML.Server.launch("../node_modules/raml-language-server-browser/worker.bundle.js");
	    filesystem.init(monacoEngine, RAML_LANGUAGE);
	    validation.init(monacoEngine, RAML_LANGUAGE);
	    completion.init(monacoEngine, RAML_LANGUAGE);
	    symbols.init(monacoEngine, RAML_LANGUAGE);
	    definition.init(monacoEngine, RAML_LANGUAGE);
	    usages.init(monacoEngine, RAML_LANGUAGE);
	    rename.init(monacoEngine, RAML_LANGUAGE);
	    RAML.Server.getConnection().setLoggerConfiguration({
	        allowedComponents: [
	            "RenameActionModule",
	            "WebServerConnection"
	        ],
	        maxSeverity: null,
	        maxMessageLength: 5000
	    });
	}
	exports.init = init;
	/**
	 * Exports current main file system as JSON.
	 * @returns {FileJSON}
	 */
	function getFileSystemJSON() {
	    return filesystem.getFileSystem().toJSON();
	}
	exports.getFileSystemJSON = getFileSystemJSON;
	/**
	 * Gets file contents by fulll path
	 * @param fullFilePath
	 */
	function getFileContents(fullFilePath) {
	    return filesystem.getFileSystem().content(fullFilePath);
	}
	exports.getFileContents = getFileContents;
	/**
	 * Saves file.
	 * @param fullPath
	 * @param contents
	 */
	function saveFile(fullPath, contents) {
	    filesystem.getFileSystem().setFileContents(fullPath, contents);
	}
	exports.saveFile = saveFile;
	function newFile(parentFullPath, fileName) {
	    filesystem.getFileSystem().newFile(parentFullPath, fileName, "");
	}
	exports.newFile = newFile;
	function newFolder(parentFullPath, fileName) {
	    filesystem.getFileSystem().newFolder(parentFullPath, fileName);
	}
	exports.newFolder = newFolder;
	function isDirectory(fullPath) {
	    return filesystem.getFileSystem().isDirectory(fullPath);
	}
	exports.isDirectory = isDirectory;
	//# sourceMappingURL=index.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.monarch = {
	    brackets: [
	        { token: 'delimiter.bracket', open: '{', close: '}' },
	        { token: 'delimiter.square', open: '[', close: ']' }
	    ],
	    keywords: ['true', 'True', 'TRUE', 'false', 'False', 'FALSE', 'null', 'Null', 'Null', '~'],
	    numberInteger: /(?:0|[+-]?[0-9]+)/,
	    numberFloat: /(?:0|[+-]?[0-9]+)(?:\.[0-9]+)?(?:e[-+][1-9][0-9]*)?/,
	    numberOctal: /0o[0-7]+/,
	    numberHex: /0x[0-9a-fA-F]+/,
	    numberInfinity: /[+-]?\.(?:inf|Inf|INF)/,
	    numberNaN: /\.(?:nan|Nan|NAN)/,
	    numberDate: /\d{4}-\d\d-\d\d([Tt ]\d\d:\d\d:\d\d(\.\d+)?(( ?[+-]\d\d?(:\d\d)?)|Z)?)?/,
	    escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
	    key: /[^\/](".*?"|'.*?'|.*?)([ \t]*)(:)( |$)/,
	    resource: /\/(".*?"|'.*?'|.*?)([ \t]*)(:)( |$)/,
	    tokenizer: {
	        root: [
	            { include: '@whitespace' },
	            { include: '@comment' },
	            [/%[^ ]+.*$/, 'meta.directive'],
	            [/---/, 'operators.directivesEnd'],
	            [/\.{3}/, 'operators.documentEnd'],
	            [/[-?:](?= )/, 'operators'],
	            { include: '@anchor' },
	            { include: '@tagHandle' },
	            { include: '@flowCollections' },
	            { include: '@blockStyle' },
	            [/@numberInteger(?![ \t]*\S+)/, 'number'],
	            [/@numberFloat(?![ \t]*\S+)/, 'number.float'],
	            [/@numberOctal(?![ \t]*\S+)/, 'number.octal'],
	            [/@numberHex(?![ \t]*\S+)/, 'number.hex'],
	            [/@numberInfinity(?![ \t]*\S+)/, 'number.infinity'],
	            [/@numberNaN(?![ \t]*\S+)/, 'number.nan'],
	            [/@numberDate(?![ \t]*\S+)/, 'number.date'],
	            ['@resource', 'raml-resource'],
	            ['@key', { cases: { '(get|post|put|delete|options|head|connect|trace)(:)( |$)': 'raml-method', '@default': 'raml-key' } }],
	            { include: '@flowScalars' },
	            [/.+$/, { cases: { '@keywords': 'keyword', '@default': 'raml-value' } }]
	        ],
	        object: [
	            { include: '@whitespace' },
	            { include: '@comment' },
	            [/\}/, '@brackets', '@pop'],
	            [/,/, 'delimiter.comma'],
	            [/:(?= )/, 'operators'],
	            [/(?:".*?"|'.*?'|[^,\{\[]+?)(?=: )/, 'type'],
	            { include: '@flowCollections' },
	            { include: '@flowScalars' },
	            { include: '@tagHandle' },
	            { include: '@anchor' },
	            { include: '@flowNumber' },
	            [/[^\},]+/, { cases: { '@keywords': 'keyword', '@default': 'string' } }]
	        ],
	        array: [
	            { include: '@whitespace' },
	            { include: '@comment' },
	            [/\]/, '@brackets', '@pop'],
	            [/,/, 'delimiter.comma'],
	            { include: '@flowCollections' },
	            { include: '@flowScalars' },
	            { include: '@tagHandle' },
	            { include: '@anchor' },
	            { include: '@flowNumber' },
	            [/[^\],]+/, { cases: { '@keywords': 'keyword', '@default': 'string' } }]
	        ],
	        string: [
	            [/[^\\"']+/, 'raml-string'],
	            [/@escapes/, 'string.escape'],
	            [/\\./, 'string.escape.invalid'],
	            [/["']/, {
	                    cases: {
	                        '$#==$S2': {
	                            token: 'string',
	                            next: '@pop'
	                        },
	                        '@default': 'string'
	                    }
	                }]
	        ],
	        multiString: [
	            [/^( +).+$/, 'string', '@multiStringContinued.$1']
	        ],
	        multiStringContinued: [
	            [/^( *).+$/, { cases: { '$1==$S2': 'string', '@default': { token: '@rematch', next: '@popall' } } }]
	        ],
	        whitespace: [
	            [/[ \t\r\n]+/, 'white']
	        ],
	        comment: [
	            [/#.*$/, 'raml-comment']
	        ],
	        flowCollections: [
	            [/\[/, '@brackets', '@array'],
	            [/\{/, '@brackets', '@object']
	        ],
	        flowScalars: [
	            [/"/, 'string', '@string."'],
	            [/'/, 'string', '@string.\'']
	        ],
	        blockStyle: [
	            [/[>|][0-9]*[+-]?$/, 'operators', '@multiString']
	        ],
	        flowNumber: [
	            [/@numberInteger(?=[ \t]*[,\]\}])/, 'number'],
	            [/@numberFloat(?=[ \t]*[,\]\}])/, 'number.float'],
	            [/@numberOctal(?=[ \t]*[,\]\}])/, 'number.octal'],
	            [/@numberHex(?=[ \t]*[,\]\}])/, 'number.hex'],
	            [/@numberInfinity(?=[ \t]*[,\]\}])/, 'number.infinity'],
	            [/@numberNaN(?=[ \t]*[,\]\}])/, 'number.nan'],
	            [/@numberDate(?=[ \t]*[,\]\}])/, 'number.date']
	        ],
	        tagHandle: [
	            [/\![^ ]*/, 'raml-include']
	        ],
	        anchor: [
	            [/[&*][^ ]+/, 'namespace']
	        ]
	    }
	};
	exports.default = exports.monarch;
	//# sourceMappingURL=coloring.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var modelListeners = {};
	var uriToModel = {};
	function newModel(model) {
	    var uri = model.uri.toString();
	    uriToModel[uri] = model;
	    RAML.Server.getConnection().documentOpened({
	        uri: uri,
	        text: model.getValue()
	    });
	}
	function modelChanged(model) {
	    var uri = model.uri.toString();
	    uriToModel[uri] = model;
	    RAML.Server.getConnection().documentChanged({
	        uri: uri,
	        text: model.getValue()
	    });
	}
	function init(monacoEngine, languageIdentifier) {
	    monacoEngine.editor.onDidCreateModel(function (model) {
	        if (model.getModeId() != languageIdentifier)
	            return;
	        modelListeners[model.uri.toString()] = model.onDidChangeContent(function () { modelChanged(model); });
	        newModel(model);
	    });
	    monacoEngine.editor.onWillDisposeModel(function (model) {
	        if (model.getModeId() != languageIdentifier)
	            return;
	        monaco.editor.setModelMarkers(model, languageIdentifier, []);
	        var uriStr = model.uri.toString();
	        var listener = modelListeners[uriStr];
	        if (listener) {
	            listener.dispose();
	            delete modelListeners[uriStr];
	        }
	        delete uriToModel[uriStr];
	    });
	    RAML.Server.getConnection().onValidationReport(function (report) {
	        var model = uriToModel[report.pointOfViewUri];
	        if (!model)
	            return;
	        var markers = report.issues.map(function (issue) {
	            var startPosition = model.getPositionAt(issue.range.start);
	            var endPosition = model.getPositionAt(issue.range.end);
	            return {
	                severity: issue.type == "Error" ? monaco.Severity.Error : monaco.Severity.Warning,
	                startLineNumber: startPosition.lineNumber,
	                startColumn: startPosition.column,
	                endLineNumber: endPosition.lineNumber,
	                endColumn: endPosition.column,
	                message: issue.text
	            };
	        });
	        monaco.editor.setModelMarkers(model, languageIdentifier, markers);
	    });
	}
	exports.init = init;
	//# sourceMappingURL=validation.js.map

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	function removeCompletionPreviousLineIndentation(originalText) {
	    var lastNewLineIndex = originalText.lastIndexOf("\n");
	    if (lastNewLineIndex == -1 || lastNewLineIndex == originalText.length - 1)
	        return originalText;
	    var textAfterLastNewLine = originalText.substring(lastNewLineIndex + 1);
	    if (textAfterLastNewLine.trim() != "")
	        return originalText;
	    return originalText.substring(0, lastNewLineIndex + 1) + "  ";
	}
	function calculateCompletionItems(model, position) {
	    var uri = model.uri.toString();
	    var offset = model.getOffsetAt(position);
	    return RAML.Server.getConnection().getSuggestions(uri, offset).then(function (suggestions) {
	        var result = [];
	        for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
	            var suggestion = suggestions_1[_i];
	            var text = suggestion.text || suggestion.displayText;
	            text = removeCompletionPreviousLineIndentation(text);
	            result.push({
	                label: text,
	                kind: monaco.languages.CompletionItemKind.Text
	            });
	        }
	        return result;
	    });
	}
	function init(monacoEngine, languageIdentifier) {
	    monacoEngine.languages.registerCompletionItemProvider(languageIdentifier, {
	        provideCompletionItems: function (model, position) {
	            return calculateCompletionItems(model, position);
	        }
	    });
	}
	exports.init = init;
	//# sourceMappingURL=completion.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var ls = __webpack_require__(9);
	var latestStructure = null;
	function calculateSymbols(model) {
	    var uri = model.uri.toString();
	    if (latestStructure) {
	        var result = [];
	        var _loop_1 = function (categoryName) {
	            var vsKind = null;
	            if ("Resources" == categoryName) {
	                vsKind = ls.SymbolKind.Function;
	            }
	            else if ("Resource Types & Traits" == categoryName) {
	                vsKind = ls.SymbolKind.Interface;
	            }
	            else if ("Schemas & Types" == categoryName) {
	                vsKind = ls.SymbolKind.Class;
	            }
	            else if ("Other" == categoryName) {
	                vsKind = ls.SymbolKind.Constant;
	            }
	            var topLevelNode = latestStructure[categoryName];
	            var items = topLevelNode.children;
	            if (items) {
	                result = result.concat(items.map(function (item) {
	                    var start = model.getPositionAt(item.start);
	                    var end = model.getPositionAt(item.end);
	                    var symbolInfo = {
	                        name: item.text,
	                        kind: vsKind,
	                        location: {
	                            uri: model.uri,
	                            range: {
	                                startLineNumber: start.lineNumber,
	                                startColumn: start.column,
	                                endLineNumber: end.lineNumber,
	                                endColumn: end.column
	                            }
	                        }
	                    };
	                    return symbolInfo;
	                }));
	            }
	        };
	        for (var categoryName in latestStructure) {
	            _loop_1(categoryName);
	        }
	        return result;
	    }
	    // return RAML.Server.getConnection().getStructure(uri).then(structure=>{
	    //     console.log("HERE2")
	    //     var result = [];
	    //     for (let categoryName in structure) {
	    //         let vsKind : ls.SymbolKind = null;
	    //
	    //         if ("Resources" == categoryName) {
	    //             vsKind = ls.SymbolKind.Function
	    //         } else if ("Resource Types & Traits" == categoryName) {
	    //             vsKind = ls.SymbolKind.Interface;
	    //         } else if ("Schemas & Types" == categoryName) {
	    //             vsKind = ls.SymbolKind.Class;
	    //         } else if ("Other" == categoryName) {
	    //             vsKind = ls.SymbolKind.Constant;
	    //         }
	    //
	    //         let topLevelNode = structure[categoryName];
	    //         let items = topLevelNode.children;
	    //         if (items) {
	    //             result = result.concat(items.map(item=>{
	    //                 let start = model.getPositionAt(item.start)
	    //                 let end = model.getPositionAt(item.end)
	    //
	    //                 let symbolInfo = {
	    //                     name: item.text,
	    //                     kind: vsKind,
	    //                     location: {
	    //                         uri: uri,
	    //                         range: {
	    //                             start: start,
	    //                             end: end
	    //                         }
	    //                     }
	    //                 }
	    //                 return symbolInfo;
	    //             }));
	    //         }
	    //     }
	    //
	    //     return result;
	    // })
	}
	function init(monacoEngine, languageIdentifier) {
	    RAML.Server.getConnection().onStructureReport(function (report) {
	        latestStructure = report.structure;
	    });
	    monacoEngine.languages.registerDocumentSymbolProvider(languageIdentifier, {
	        provideDocumentSymbols: function (model, token) {
	            return calculateSymbols(model);
	        }
	    });
	}
	exports.init = init;
	//# sourceMappingURL=symbols.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	function calculateDefinition(model, position) {
	    var uri = model.uri.toString();
	    var offset = model.getOffsetAt(position);
	    return RAML.Server.getConnection().openDeclaration(uri, offset).then(function (locations) {
	        if (!locations || locations.length < 1)
	            return null;
	        var location = locations[0];
	        var start = model.getPositionAt(location.range.start);
	        var end = model.getPositionAt(location.range.end);
	        return {
	            uri: model.uri,
	            range: {
	                startLineNumber: start.lineNumber,
	                startColumn: start.column,
	                endLineNumber: end.lineNumber,
	                endColumn: end.column
	            }
	        };
	    });
	}
	function init(monacoEngine, languageIdentifier) {
	    monacoEngine.languages.registerDefinitionProvider(languageIdentifier, {
	        provideDefinition: function (model, position, token) {
	            return calculateDefinition(model, position);
	        }
	    });
	}
	exports.init = init;
	//# sourceMappingURL=definition.js.map

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	function calculateUsages(model, position) {
	    var uri = model.uri.toString();
	    var offset = model.getOffsetAt(position);
	    return RAML.Server.getConnection().findReferences(uri, offset).then(function (locations) {
	        var result = [];
	        if (!locations || locations.length < 1)
	            return result;
	        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
	            var location_1 = locations_1[_i];
	            var start = model.getPositionAt(location_1.range.start);
	            var end = model.getPositionAt(location_1.range.end);
	            result.push({
	                uri: model.uri,
	                range: {
	                    startLineNumber: start.lineNumber,
	                    startColumn: start.column,
	                    endLineNumber: end.lineNumber,
	                    endColumn: end.column
	                }
	            });
	        }
	        return result;
	    });
	}
	function init(monacoEngine, languageIdentifier) {
	    monacoEngine.languages.registerReferenceProvider(languageIdentifier, {
	        provideReferences: function (model, position, context, token) {
	            return calculateUsages(model, position);
	        }
	    });
	}
	exports.init = init;
	//# sourceMappingURL=usages.js.map

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	function rename(model, position, newName) {
	    var uri = model.uri.toString();
	    var offset = model.getOffsetAt(position);
	    return RAML.Server.getConnection().rename(uri, offset, newName).then(function (changedDocuments) {
	        if (!changedDocuments || changedDocuments.length < 1)
	            return null;
	        var result = {
	            edits: []
	        };
	        for (var _i = 0, changedDocuments_1 = changedDocuments; _i < changedDocuments_1.length; _i++) {
	            var changedDocument = changedDocuments_1[_i];
	            if (changedDocument.text !== null) {
	                var fullModelRange = model.getFullModelRange();
	                var resourceEdit = {
	                    resource: model.uri,
	                    newText: changedDocument.text,
	                    range: {
	                        startLineNumber: fullModelRange.startLineNumber,
	                        startColumn: fullModelRange.startColumn,
	                        endLineNumber: fullModelRange.endLineNumber,
	                        endColumn: fullModelRange.endColumn
	                    }
	                };
	                result.edits.push(resourceEdit);
	            }
	            else if (changedDocument.textEdits) {
	                for (var _a = 0, _b = changedDocument.textEdits; _a < _b.length; _a++) {
	                    var textEdit = _b[_a];
	                    var serverRange = textEdit.range;
	                    var start = model.getPositionAt(serverRange.start);
	                    var end = model.getPositionAt(serverRange.end);
	                    var modelRange = {
	                        startLineNumber: start.lineNumber,
	                        startColumn: start.column,
	                        endLineNumber: end.lineNumber,
	                        endColumn: end.column
	                    };
	                    var resourceEdit = {
	                        resource: model.uri,
	                        newText: textEdit.text,
	                        range: modelRange
	                    };
	                    result.edits.push(resourceEdit);
	                }
	            }
	        }
	        return result;
	    });
	}
	function init(monacoEngine, languageIdentifier) {
	    monacoEngine.languages.registerRenameProvider(languageIdentifier, {
	        provideRenameEdits: function (model, position, newName, token) {
	            return rename(model, position, newName);
	        }
	    });
	}
	exports.init = init;
	//# sourceMappingURL=rename.js.map

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var FileEntry = (function () {
	    function FileEntry(name, parent, isFolder) {
	        /**
	         * Folder children, empty for files.
	         */
	        this.children = [];
	        this.name = name;
	        this.parent = parent;
	        if (this.parent) {
	            this.parent.children.push(this);
	        }
	        this.isFolder = isFolder;
	    }
	    /**
	     * Whether this entry is FS root.
	     */
	    FileEntry.prototype.isRoot = function () {
	        return this.parent == null;
	    };
	    FileEntry.prototype.getFullPath = function () {
	        var segmentEntries = [];
	        var current = this;
	        while (current) {
	            segmentEntries.unshift(current);
	            current = current.parent;
	        }
	        return segmentEntries.map(function (segment) { return segment.name; }).join("/");
	    };
	    FileEntry.prototype.childByName = function (name) {
	        if (!this.isFolder)
	            return null;
	        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
	            var child = _a[_i];
	            if (child.name == name)
	                return child;
	        }
	        return null;
	    };
	    FileEntry.prototype.toJSON = function () {
	        var result = {
	            text: this.name,
	            fullPath: this.getFullPath(),
	            id: this.getFullPath(),
	            icon: this.isFolder ? "glyphicon glyphicon-folder-open" : "glyphicon glyphicon-file"
	        };
	        if (this.children && this.children.length > 0) {
	            result.nodes = this.children.map(function (child) { return child.toJSON(); });
	        }
	        return result;
	    };
	    return FileEntry;
	}());
	var VirtualFileSystem = (function () {
	    function VirtualFileSystem() {
	        this.root = new FileEntry(null, null, true);
	    }
	    /**
	     * File contents by full path, asynchronously.
	     * @param fullPath
	     */
	    VirtualFileSystem.prototype.contentAsync = function (fullPath) {
	        var entry = this.entryByFullPath(fullPath);
	        if (!entry)
	            return Promise.reject(new Error(fullPath + " does not exist"));
	        if (entry.isFolder)
	            return Promise.reject(new Error(fullPath + " is not a file"));
	        if (entry.contents === null)
	            return Promise.reject(new Error(fullPath + " file has no contents"));
	        return Promise.resolve(entry.contents);
	    };
	    /**
	     * File contents by full path, asynchronously.
	     * @param fullPath
	     */
	    VirtualFileSystem.prototype.content = function (fullPath) {
	        var entry = this.entryByFullPath(fullPath);
	        if (!entry)
	            throw new Error(fullPath + " does not exist");
	        if (entry.isFolder)
	            throw new Error(fullPath + " is not a file");
	        if (entry.contents === null)
	            throw new Error(fullPath + " file has no contents");
	        return entry.contents;
	    };
	    /**
	     * Check whether the path points to a directory.
	     * @param fullPath
	     */
	    VirtualFileSystem.prototype.isDirectoryAsync = function (path) {
	        var entry = this.entryByFullPath(path);
	        if (!entry)
	            return Promise.reject(new Error(path + " does not exist"));
	        return Promise.resolve(entry.isFolder);
	    };
	    /**
	     * Check whether the path points to a directory.
	     * @param fullPath
	     */
	    VirtualFileSystem.prototype.isDirectory = function (path) {
	        if (path == null || path == "/")
	            return true;
	        var entry = this.entryByFullPath(path);
	        if (!entry)
	            throw new Error(path + " does not exist");
	        return entry.isFolder;
	    };
	    /**
	     * Checks item existance.
	     * @param fullPath
	     */
	    VirtualFileSystem.prototype.existsAsync = function (path) {
	        var entry = this.entryByFullPath(path);
	        return Promise.resolve(entry ? true : false);
	    };
	    /**
	     * Lists directory contents.
	     * @param fullPath
	     */
	    VirtualFileSystem.prototype.listAsync = function (path) {
	        var entry = this.entryByFullPath(path);
	        if (!entry)
	            return Promise.reject(new Error(path + " does not exist"));
	        if (!entry.isFolder)
	            return Promise.reject(new Error(path + " is a file"));
	        return Promise.resolve(entry.children.map(function (child) { return child.name; }));
	    };
	    /**
	     * Creates new file at the path.
	     * @param parentFolderPath - parent folder path, null for root
	     * @param fileName - new file name
	     * @param contents - optional file contents
	     */
	    VirtualFileSystem.prototype.newFile = function (parentFolderPath, fileName, contents) {
	        var parent = (!parentFolderPath || parentFolderPath == "/") ?
	            this.root : this.entryByFullPath(parentFolderPath);
	        if (!parent)
	            throw new Error(parentFolderPath + " does not exist");
	        if (!parent.isFolder)
	            throw new Error(parentFolderPath + " is file");
	        if (parent.childByName(fileName))
	            throw new Error("File" + fileName
	                + " already exists in " + parentFolderPath);
	        var result = new FileEntry(fileName, parent, false);
	        result.contents = contents;
	    };
	    /**
	     * Creates new folder at the path.
	     * @param parentFolderPath - parent folder path, null for root
	     * @param folderName - new folder name
	     */
	    VirtualFileSystem.prototype.newFolder = function (parentFolderPath, folderName) {
	        var parent = (!parentFolderPath || parentFolderPath == "/") ?
	            this.root : this.entryByFullPath(parentFolderPath);
	        if (!parent)
	            throw new Error(parentFolderPath + " does not exist");
	        if (!parent.isFolder)
	            throw new Error(parentFolderPath + " is file");
	        if (parent.childByName(folderName))
	            throw new Error("File" + folderName
	                + " already exists in " + parentFolderPath);
	        var result = new FileEntry(folderName, parent, true);
	    };
	    /**
	     * Sets file contents.
	     * @param path
	     * @param contents
	     * @returns {Promise<any>}
	     */
	    VirtualFileSystem.prototype.setFileContents = function (path, contents) {
	        var entry = this.entryByFullPath(path);
	        if (!entry)
	            throw new Error(path + " does not exist");
	        if (entry.isFolder)
	            throw new Error(path + " is not a file");
	        entry.contents = contents;
	    };
	    /**
	     * Exports the whole file system as JSON. Root element has empty text.
	     */
	    VirtualFileSystem.prototype.toJSON = function () {
	        return this.root.toJSON();
	    };
	    VirtualFileSystem.prototype.entryByFullPath = function (path) {
	        if (!path)
	            return null;
	        var segments = path.split("/");
	        var currentEntry = this.root;
	        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
	            var segment = segments_1[_i];
	            if (!segment)
	                continue;
	            var child = currentEntry.childByName(segment);
	            if (!child)
	                return null;
	            currentEntry = child;
	        }
	        return currentEntry;
	    };
	    return VirtualFileSystem;
	}());
	var fileSystem = new VirtualFileSystem();
	function getFileSystem() {
	    return fileSystem;
	}
	exports.getFileSystem = getFileSystem;
	function init(monacoEngine, languageIdentifier) {
	    var fs = getFileSystem();
	    RAML.Server.getConnection().onExists(function (path) { return fs.existsAsync(path); });
	    RAML.Server.getConnection().onReadDir(function (path) { return fs.listAsync(path); });
	    RAML.Server.getConnection().onIsDirectory(function (path) { return fs.isDirectoryAsync(path); });
	    RAML.Server.getConnection().onContent(function (path) { return fs.contentAsync(path); });
	    fs.newFile(null, "test.raml", [
	        '#%RAML 1.0',
	        'title: Test API'
	    ].join('\n'));
	    fs.newFile(null, "library2.raml", [
	        '#%RAML 1.0 Library',
	        '',
	        '  types:',
	        '    DaType:',
	        '      type: object',
	        '      properties:',
	        '        testProp: string',
	    ].join('\n'));
	}
	exports.init = init;
	//# sourceMappingURL=filesystem.js.map

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	    if (typeof module === "object" && typeof module.exports === "object") {
	        var v = factory(__webpack_require__(10), exports);
	        if (v !== undefined) module.exports = v;
	    }
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	})(function (require, exports) {
	    /* --------------------------------------------------------------------------------------------
	     * Copyright (c) Microsoft Corporation. All rights reserved.
	     * Licensed under the MIT License. See License.txt in the project root for license information.
	     * ------------------------------------------------------------------------------------------ */
	    'use strict';
	    /**
	     * The Position namespace provides helper functions to work with
	     * [Position](#Position) literals.
	     */
	    var Position;
	    (function (Position) {
	        /**
	         * Creates a new Position literal from the given line and character.
	         * @param line The position's line.
	         * @param character The position's character.
	         */
	        function create(line, character) {
	            return { line: line, character: character };
	        }
	        Position.create = create;
	        /**
	         * Checks whether the given liternal conforms to the [Position](#Position) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.number(candidate.line) && Is.number(candidate.character);
	        }
	        Position.is = is;
	    })(Position = exports.Position || (exports.Position = {}));
	    /**
	     * The Range namespace provides helper functions to work with
	     * [Range](#Range) literals.
	     */
	    var Range;
	    (function (Range) {
	        function create(one, two, three, four) {
	            if (Is.number(one) && Is.number(two) && Is.number(three) && Is.number(four)) {
	                return { start: Position.create(one, two), end: Position.create(three, four) };
	            }
	            else if (Position.is(one) && Position.is(two)) {
	                return { start: one, end: two };
	            }
	            else {
	                throw new Error("Range#create called with invalid arguments[" + one + ", " + two + ", " + three + ", " + four + "]");
	            }
	        }
	        Range.create = create;
	        /**
	         * Checks whether the given literal conforms to the [Range](#Range) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
	        }
	        Range.is = is;
	    })(Range = exports.Range || (exports.Range = {}));
	    /**
	     * The Location namespace provides helper functions to work with
	     * [Location](#Location) literals.
	     */
	    var Location;
	    (function (Location) {
	        /**
	         * Creates a Location literal.
	         * @param uri The location's uri.
	         * @param range The location's range.
	         */
	        function create(uri, range) {
	            return { uri: uri, range: range };
	        }
	        Location.create = create;
	        /**
	         * Checks whether the given literal conforms to the [Location](#Location) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
	        }
	        Location.is = is;
	    })(Location = exports.Location || (exports.Location = {}));
	    /**
	     * The diagnostic's serverity.
	     */
	    var DiagnosticSeverity;
	    (function (DiagnosticSeverity) {
	        /**
	         * Reports an error.
	         */
	        DiagnosticSeverity.Error = 1;
	        /**
	         * Reports a warning.
	         */
	        DiagnosticSeverity.Warning = 2;
	        /**
	         * Reports an information.
	         */
	        DiagnosticSeverity.Information = 3;
	        /**
	         * Reports a hint.
	         */
	        DiagnosticSeverity.Hint = 4;
	    })(DiagnosticSeverity = exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
	    /**
	     * The Diagnostic namespace provides helper functions to work with
	     * [Diagnostic](#Diagnostic) literals.
	     */
	    var Diagnostic;
	    (function (Diagnostic) {
	        /**
	         * Creates a new Diagnostic literal.
	         */
	        function create(range, message, severity, code, source) {
	            var result = { range: range, message: message };
	            if (Is.defined(severity)) {
	                result.severity = severity;
	            }
	            if (Is.defined(code)) {
	                result.code = code;
	            }
	            if (Is.defined(source)) {
	                result.source = source;
	            }
	            return result;
	        }
	        Diagnostic.create = create;
	        /**
	         * Checks whether the given literal conforms to the [Diagnostic](#Diagnostic) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate)
	                && Range.is(candidate.range)
	                && Is.string(candidate.message)
	                && (Is.number(candidate.severity) || Is.undefined(candidate.severity))
	                && (Is.number(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code))
	                && (Is.string(candidate.source) || Is.undefined(candidate.source));
	        }
	        Diagnostic.is = is;
	    })(Diagnostic = exports.Diagnostic || (exports.Diagnostic = {}));
	    /**
	     * The Command namespace provides helper functions to work with
	     * [Command](#Command) literals.
	     */
	    var Command;
	    (function (Command) {
	        /**
	         * Creates a new Command literal.
	         */
	        function create(title, command) {
	            var args = [];
	            for (var _i = 2; _i < arguments.length; _i++) {
	                args[_i - 2] = arguments[_i];
	            }
	            var result = { title: title, command: command };
	            if (Is.defined(args) && args.length > 0) {
	                result.arguments = args;
	            }
	            return result;
	        }
	        Command.create = create;
	        /**
	         * Checks whether the given literal conforms to the [Command](#Command) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.title);
	        }
	        Command.is = is;
	    })(Command = exports.Command || (exports.Command = {}));
	    /**
	     * The TextEdit namespace provides helper function to create replace,
	     * insert and delete edits more easily.
	     */
	    var TextEdit;
	    (function (TextEdit) {
	        /**
	         * Creates a replace text edit.
	         * @param range The range of text to be replaced.
	         * @param newText The new text.
	         */
	        function replace(range, newText) {
	            return { range: range, newText: newText };
	        }
	        TextEdit.replace = replace;
	        /**
	         * Creates a insert text edit.
	         * @param psotion The position to insert the text at.
	         * @param newText The text to be inserted.
	         */
	        function insert(position, newText) {
	            return { range: { start: position, end: position }, newText: newText };
	        }
	        TextEdit.insert = insert;
	        /**
	         * Creates a delete text edit.
	         * @param range The range of text to be deleted.
	         */
	        function del(range) {
	            return { range: range, newText: '' };
	        }
	        TextEdit.del = del;
	    })(TextEdit = exports.TextEdit || (exports.TextEdit = {}));
	    /**
	     * The TextDocumentEdit namespace provides helper function to create
	     * an edit that manipulates a text document.
	     */
	    var TextDocumentEdit;
	    (function (TextDocumentEdit) {
	        /**
	         * Creates a new `TextDocumentEdit`
	         */
	        function create(textDocument, edits) {
	            return { textDocument: textDocument, edits: edits };
	        }
	        TextDocumentEdit.create = create;
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate)
	                && VersionedTextDocumentIdentifier.is(candidate.textDocument)
	                && Array.isArray(candidate.edits);
	        }
	        TextDocumentEdit.is = is;
	    })(TextDocumentEdit = exports.TextDocumentEdit || (exports.TextDocumentEdit = {}));
	    var TextEditChangeImpl = (function () {
	        function TextEditChangeImpl(edits) {
	            this.edits = edits;
	        }
	        TextEditChangeImpl.prototype.insert = function (position, newText) {
	            this.edits.push(TextEdit.insert(position, newText));
	        };
	        TextEditChangeImpl.prototype.replace = function (range, newText) {
	            this.edits.push(TextEdit.replace(range, newText));
	        };
	        TextEditChangeImpl.prototype.delete = function (range) {
	            this.edits.push(TextEdit.del(range));
	        };
	        TextEditChangeImpl.prototype.add = function (edit) {
	            this.edits.push(edit);
	        };
	        TextEditChangeImpl.prototype.all = function () {
	            return this.edits;
	        };
	        TextEditChangeImpl.prototype.clear = function () {
	            this.edits.splice(0, this.edits.length);
	        };
	        return TextEditChangeImpl;
	    }());
	    /**
	     * A workspace change helps constructing changes to a workspace.
	     */
	    var WorkspaceChange = (function () {
	        function WorkspaceChange(workspaceEdit) {
	            var _this = this;
	            this._textEditChanges = Object.create(null);
	            if (workspaceEdit) {
	                this._workspaceEdit = workspaceEdit;
	                if (workspaceEdit.documentChanges) {
	                    workspaceEdit.documentChanges.forEach(function (textDocumentEdit) {
	                        var textEditChange = new TextEditChangeImpl(textDocumentEdit.edits);
	                        _this._textEditChanges[textDocumentEdit.textDocument.uri] = textEditChange;
	                    });
	                }
	                else if (workspaceEdit.changes) {
	                    Object.keys(workspaceEdit.changes).forEach(function (key) {
	                        var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
	                        _this._textEditChanges[key] = textEditChange;
	                    });
	                }
	            }
	        }
	        Object.defineProperty(WorkspaceChange.prototype, "edit", {
	            /**
	             * Returns the underlying [WorkspaceEdit](#WorkspaceEdit) literal
	             * use to be returned from a workspace edit operation like rename.
	             */
	            get: function () {
	                return this._workspaceEdit;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        WorkspaceChange.prototype.getTextEditChange = function (key) {
	            if (VersionedTextDocumentIdentifier.is(key)) {
	                if (!this._workspaceEdit) {
	                    this._workspaceEdit = {
	                        documentChanges: []
	                    };
	                }
	                if (!this._workspaceEdit.documentChanges) {
	                    throw new Error('Workspace edit is not configured for versioned document changes.');
	                }
	                var textDocument = key;
	                var result = this._textEditChanges[textDocument.uri];
	                if (!result) {
	                    var edits = [];
	                    var textDocumentEdit = {
	                        textDocument: textDocument,
	                        edits: edits
	                    };
	                    this._workspaceEdit.documentChanges.push(textDocumentEdit);
	                    result = new TextEditChangeImpl(edits);
	                    this._textEditChanges[textDocument.uri] = result;
	                }
	                return result;
	            }
	            else {
	                if (!this._workspaceEdit) {
	                    this._workspaceEdit = {
	                        changes: Object.create(null)
	                    };
	                }
	                if (!this._workspaceEdit.changes) {
	                    throw new Error('Workspace edit is not configured for normal text edit changes.');
	                }
	                var result = this._textEditChanges[key];
	                if (!result) {
	                    var edits = [];
	                    this._workspaceEdit.changes[key] = edits;
	                    result = new TextEditChangeImpl(edits);
	                    this._textEditChanges[key] = result;
	                }
	                return result;
	            }
	        };
	        return WorkspaceChange;
	    }());
	    exports.WorkspaceChange = WorkspaceChange;
	    /**
	     * The TextDocumentIdentifier namespace provides helper functions to work with
	     * [TextDocumentIdentifier](#TextDocumentIdentifier) literals.
	     */
	    var TextDocumentIdentifier;
	    (function (TextDocumentIdentifier) {
	        /**
	         * Creates a new TextDocumentIdentifier literal.
	         * @param uri The document's uri.
	         */
	        function create(uri) {
	            return { uri: uri };
	        }
	        TextDocumentIdentifier.create = create;
	        /**
	         * Checks whether the given literal conforms to the [TextDocumentIdentifier](#TextDocumentIdentifier) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.string(candidate.uri);
	        }
	        TextDocumentIdentifier.is = is;
	    })(TextDocumentIdentifier = exports.TextDocumentIdentifier || (exports.TextDocumentIdentifier = {}));
	    /**
	     * The VersionedTextDocumentIdentifier namespace provides helper functions to work with
	     * [VersionedTextDocumentIdentifier](#VersionedTextDocumentIdentifier) literals.
	     */
	    var VersionedTextDocumentIdentifier;
	    (function (VersionedTextDocumentIdentifier) {
	        /**
	         * Creates a new VersionedTextDocumentIdentifier literal.
	         * @param uri The document's uri.
	         * @param uri The document's text.
	         */
	        function create(uri, version) {
	            return { uri: uri, version: version };
	        }
	        VersionedTextDocumentIdentifier.create = create;
	        /**
	         * Checks whether the given literal conforms to the [VersionedTextDocumentIdentifier](#VersionedTextDocumentIdentifier) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.string(candidate.uri) && Is.number(candidate.version);
	        }
	        VersionedTextDocumentIdentifier.is = is;
	    })(VersionedTextDocumentIdentifier = exports.VersionedTextDocumentIdentifier || (exports.VersionedTextDocumentIdentifier = {}));
	    /**
	     * The TextDocumentItem namespace provides helper functions to work with
	     * [TextDocumentItem](#TextDocumentItem) literals.
	     */
	    var TextDocumentItem;
	    (function (TextDocumentItem) {
	        /**
	         * Creates a new TextDocumentItem literal.
	         * @param uri The document's uri.
	         * @param uri The document's language identifier.
	         * @param uri The document's version number.
	         * @param uri The document's text.
	         */
	        function create(uri, languageId, version, text) {
	            return { uri: uri, languageId: languageId, version: version, text: text };
	        }
	        TextDocumentItem.create = create;
	        /**
	         * Checks whether the given literal conforms to the [TextDocumentItem](#TextDocumentItem) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.number(candidate.version) && Is.string(candidate.text);
	        }
	        TextDocumentItem.is = is;
	    })(TextDocumentItem = exports.TextDocumentItem || (exports.TextDocumentItem = {}));
	    /**
	     * The kind of a completion entry.
	     */
	    var CompletionItemKind;
	    (function (CompletionItemKind) {
	        CompletionItemKind.Text = 1;
	        CompletionItemKind.Method = 2;
	        CompletionItemKind.Function = 3;
	        CompletionItemKind.Constructor = 4;
	        CompletionItemKind.Field = 5;
	        CompletionItemKind.Variable = 6;
	        CompletionItemKind.Class = 7;
	        CompletionItemKind.Interface = 8;
	        CompletionItemKind.Module = 9;
	        CompletionItemKind.Property = 10;
	        CompletionItemKind.Unit = 11;
	        CompletionItemKind.Value = 12;
	        CompletionItemKind.Enum = 13;
	        CompletionItemKind.Keyword = 14;
	        CompletionItemKind.Snippet = 15;
	        CompletionItemKind.Color = 16;
	        CompletionItemKind.File = 17;
	        CompletionItemKind.Reference = 18;
	    })(CompletionItemKind = exports.CompletionItemKind || (exports.CompletionItemKind = {}));
	    /**
	     * Defines whether the insert text in a completion item should be interpreted as
	     * plain text or a snippet.
	     */
	    var InsertTextFormat;
	    (function (InsertTextFormat) {
	        /**
	         * The primary text to be inserted is treated as a plain string.
	         */
	        InsertTextFormat.PlainText = 1;
	        /**
	         * The primary text to be inserted is treated as a snippet.
	         *
	         * A snippet can define tab stops and placeholders with `$1`, `$2`
	         * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
	         * the end of the snippet. Placeholders with equal identifiers are linked,
	         * that is typing in one will update others too.
	         *
	         * See also: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/snippet/common/snippet.md
	         */
	        InsertTextFormat.Snippet = 2;
	    })(InsertTextFormat = exports.InsertTextFormat || (exports.InsertTextFormat = {}));
	    /**
	     * The CompletionItem namespace provides functions to deal with
	     * completion items.
	     */
	    var CompletionItem;
	    (function (CompletionItem) {
	        /**
	         * Create a completion item and seed it with a label.
	         * @param label The completion item's label
	         */
	        function create(label) {
	            return { label: label };
	        }
	        CompletionItem.create = create;
	    })(CompletionItem = exports.CompletionItem || (exports.CompletionItem = {}));
	    /**
	     * The CompletionList namespace provides functions to deal with
	     * completion lists.
	     */
	    var CompletionList;
	    (function (CompletionList) {
	        /**
	         * Creates a new completion list.
	         *
	         * @param items The completion items.
	         * @param isIncomplete The list is not complete.
	         */
	        function create(items, isIncomplete) {
	            return { items: items ? items : [], isIncomplete: !!isIncomplete };
	        }
	        CompletionList.create = create;
	    })(CompletionList = exports.CompletionList || (exports.CompletionList = {}));
	    var MarkedString;
	    (function (MarkedString) {
	        /**
	         * Creates a marked string from plain text.
	         *
	         * @param plainText The plain text.
	         */
	        function fromPlainText(plainText) {
	            return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&"); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
	        }
	        MarkedString.fromPlainText = fromPlainText;
	    })(MarkedString = exports.MarkedString || (exports.MarkedString = {}));
	    /**
	     * The ParameterInformation namespace provides helper functions to work with
	     * [ParameterInformation](#ParameterInformation) literals.
	     */
	    var ParameterInformation;
	    (function (ParameterInformation) {
	        /**
	         * Creates a new parameter information literal.
	         *
	         * @param label A label string.
	         * @param documentation A doc string.
	         */
	        function create(label, documentation) {
	            return documentation ? { label: label, documentation: documentation } : { label: label };
	        }
	        ParameterInformation.create = create;
	        ;
	    })(ParameterInformation = exports.ParameterInformation || (exports.ParameterInformation = {}));
	    /**
	     * The SignatureInformation namespace provides helper functions to work with
	     * [SignatureInformation](#SignatureInformation) literals.
	     */
	    var SignatureInformation;
	    (function (SignatureInformation) {
	        function create(label, documentation) {
	            var parameters = [];
	            for (var _i = 2; _i < arguments.length; _i++) {
	                parameters[_i - 2] = arguments[_i];
	            }
	            var result = { label: label };
	            if (Is.defined(documentation)) {
	                result.documentation = documentation;
	            }
	            if (Is.defined(parameters)) {
	                result.parameters = parameters;
	            }
	            else {
	                result.parameters = [];
	            }
	            return result;
	        }
	        SignatureInformation.create = create;
	    })(SignatureInformation = exports.SignatureInformation || (exports.SignatureInformation = {}));
	    /**
	     * A document highlight kind.
	     */
	    var DocumentHighlightKind;
	    (function (DocumentHighlightKind) {
	        /**
	         * A textual occurrance.
	         */
	        DocumentHighlightKind.Text = 1;
	        /**
	         * Read-access of a symbol, like reading a variable.
	         */
	        DocumentHighlightKind.Read = 2;
	        /**
	         * Write-access of a symbol, like writing to a variable.
	         */
	        DocumentHighlightKind.Write = 3;
	    })(DocumentHighlightKind = exports.DocumentHighlightKind || (exports.DocumentHighlightKind = {}));
	    /**
	     * DocumentHighlight namespace to provide helper functions to work with
	     * [DocumentHighlight](#DocumentHighlight) literals.
	     */
	    var DocumentHighlight;
	    (function (DocumentHighlight) {
	        /**
	         * Create a DocumentHighlight object.
	         * @param range The range the highlight applies to.
	         */
	        function create(range, kind) {
	            var result = { range: range };
	            if (Is.number(kind)) {
	                result.kind = kind;
	            }
	            return result;
	        }
	        DocumentHighlight.create = create;
	    })(DocumentHighlight = exports.DocumentHighlight || (exports.DocumentHighlight = {}));
	    /**
	     * A symbol kind.
	     */
	    var SymbolKind;
	    (function (SymbolKind) {
	        SymbolKind.File = 1;
	        SymbolKind.Module = 2;
	        SymbolKind.Namespace = 3;
	        SymbolKind.Package = 4;
	        SymbolKind.Class = 5;
	        SymbolKind.Method = 6;
	        SymbolKind.Property = 7;
	        SymbolKind.Field = 8;
	        SymbolKind.Constructor = 9;
	        SymbolKind.Enum = 10;
	        SymbolKind.Interface = 11;
	        SymbolKind.Function = 12;
	        SymbolKind.Variable = 13;
	        SymbolKind.Constant = 14;
	        SymbolKind.String = 15;
	        SymbolKind.Number = 16;
	        SymbolKind.Boolean = 17;
	        SymbolKind.Array = 18;
	    })(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
	    var SymbolInformation;
	    (function (SymbolInformation) {
	        /**
	         * Creates a new symbol information literal.
	         *
	         * @param name The name of the symbol.
	         * @param kind The kind of the symbol.
	         * @param range The range of the location of the symbol.
	         * @param uri The resource of the location of symbol, defaults to the current document.
	         * @param containerName The name of the symbol containg the symbol.
	         */
	        function create(name, kind, range, uri, containerName) {
	            var result = {
	                name: name,
	                kind: kind,
	                location: { uri: uri, range: range }
	            };
	            if (containerName) {
	                result.containerName = containerName;
	            }
	            return result;
	        }
	        SymbolInformation.create = create;
	    })(SymbolInformation = exports.SymbolInformation || (exports.SymbolInformation = {}));
	    /**
	     * The CodeActionContext namespace provides helper functions to work with
	     * [CodeActionContext](#CodeActionContext) literals.
	     */
	    var CodeActionContext;
	    (function (CodeActionContext) {
	        /**
	         * Creates a new CodeActionContext literal.
	         */
	        function create(diagnostics) {
	            return { diagnostics: diagnostics };
	        }
	        CodeActionContext.create = create;
	        /**
	         * Checks whether the given literal conforms to the [CodeActionContext](#CodeActionContext) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is);
	        }
	        CodeActionContext.is = is;
	    })(CodeActionContext = exports.CodeActionContext || (exports.CodeActionContext = {}));
	    /**
	     * The CodeLens namespace provides helper functions to work with
	     * [CodeLens](#CodeLens) literals.
	     */
	    var CodeLens;
	    (function (CodeLens) {
	        /**
	         * Creates a new CodeLens literal.
	         */
	        function create(range, data) {
	            var result = { range: range };
	            if (Is.defined(data))
	                result.data = data;
	            return result;
	        }
	        CodeLens.create = create;
	        /**
	         * Checks whether the given literal conforms to the [CodeLens](#CodeLens) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
	        }
	        CodeLens.is = is;
	    })(CodeLens = exports.CodeLens || (exports.CodeLens = {}));
	    /**
	     * The FormattingOptions namespace provides helper functions to work with
	     * [FormattingOptions](#FormattingOptions) literals.
	     */
	    var FormattingOptions;
	    (function (FormattingOptions) {
	        /**
	         * Creates a new FormattingOptions literal.
	         */
	        function create(tabSize, insertSpaces) {
	            return { tabSize: tabSize, insertSpaces: insertSpaces };
	        }
	        FormattingOptions.create = create;
	        /**
	         * Checks whether the given literal conforms to the [FormattingOptions](#FormattingOptions) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.number(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
	        }
	        FormattingOptions.is = is;
	    })(FormattingOptions = exports.FormattingOptions || (exports.FormattingOptions = {}));
	    /**
	     * A document link is a range in a text document that links to an internal or external resource, like another
	     * text document or a web site.
	     */
	    var DocumentLink = (function () {
	        function DocumentLink() {
	        }
	        return DocumentLink;
	    }());
	    exports.DocumentLink = DocumentLink;
	    /**
	     * The DocumentLink namespace provides helper functions to work with
	     * [DocumentLink](#DocumentLink) literals.
	     */
	    (function (DocumentLink) {
	        /**
	         * Creates a new DocumentLink literal.
	         */
	        function create(range, target) {
	            return { range: range, target: target };
	        }
	        DocumentLink.create = create;
	        /**
	         * Checks whether the given literal conforms to the [DocumentLink](#DocumentLink) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
	        }
	        DocumentLink.is = is;
	    })(DocumentLink = exports.DocumentLink || (exports.DocumentLink = {}));
	    exports.DocumentLink = DocumentLink;
	    exports.EOL = ['\n', '\r\n', '\r'];
	    var TextDocument;
	    (function (TextDocument) {
	        /**
	         * Creates a new ITextDocument literal from the given uri and content.
	         * @param uri The document's uri.
	         * @param languageId  The document's language Id.
	         * @param content The document's content.
	         */
	        function create(uri, languageId, version, content) {
	            return new FullTextDocument(uri, languageId, version, content);
	        }
	        TextDocument.create = create;
	        /**
	         * Checks whether the given literal conforms to the [ITextDocument](#ITextDocument) interface.
	         */
	        function is(value) {
	            var candidate = value;
	            return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.number(candidate.lineCount)
	                && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
	        }
	        TextDocument.is = is;
	    })(TextDocument = exports.TextDocument || (exports.TextDocument = {}));
	    /**
	     * Represents reasons why a text document is saved.
	     */
	    var TextDocumentSaveReason;
	    (function (TextDocumentSaveReason) {
	        /**
	         * Manually triggered, e.g. by the user pressing save, by starting debugging,
	         * or by an API call.
	         */
	        TextDocumentSaveReason.Manual = 1;
	        /**
	         * Automatic after a delay.
	         */
	        TextDocumentSaveReason.AfterDelay = 2;
	        /**
	         * When the editor lost focus.
	         */
	        TextDocumentSaveReason.FocusOut = 3;
	    })(TextDocumentSaveReason = exports.TextDocumentSaveReason || (exports.TextDocumentSaveReason = {}));
	    var FullTextDocument = (function () {
	        function FullTextDocument(uri, languageId, version, content) {
	            this._uri = uri;
	            this._languageId = languageId;
	            this._version = version;
	            this._content = content;
	            this._lineOffsets = null;
	        }
	        Object.defineProperty(FullTextDocument.prototype, "uri", {
	            get: function () {
	                return this._uri;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(FullTextDocument.prototype, "languageId", {
	            get: function () {
	                return this._languageId;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(FullTextDocument.prototype, "version", {
	            get: function () {
	                return this._version;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        FullTextDocument.prototype.getText = function () {
	            return this._content;
	        };
	        FullTextDocument.prototype.update = function (event, version) {
	            this._content = event.text;
	            this._version = version;
	            this._lineOffsets = null;
	        };
	        FullTextDocument.prototype.getLineOffsets = function () {
	            if (this._lineOffsets === null) {
	                var lineOffsets = [];
	                var text = this._content;
	                var isLineStart = true;
	                for (var i = 0; i < text.length; i++) {
	                    if (isLineStart) {
	                        lineOffsets.push(i);
	                        isLineStart = false;
	                    }
	                    var ch = text.charAt(i);
	                    isLineStart = (ch === '\r' || ch === '\n');
	                    if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
	                        i++;
	                    }
	                }
	                if (isLineStart && text.length > 0) {
	                    lineOffsets.push(text.length);
	                }
	                this._lineOffsets = lineOffsets;
	            }
	            return this._lineOffsets;
	        };
	        FullTextDocument.prototype.positionAt = function (offset) {
	            offset = Math.max(Math.min(offset, this._content.length), 0);
	            var lineOffsets = this.getLineOffsets();
	            var low = 0, high = lineOffsets.length;
	            if (high === 0) {
	                return Position.create(0, offset);
	            }
	            while (low < high) {
	                var mid = Math.floor((low + high) / 2);
	                if (lineOffsets[mid] > offset) {
	                    high = mid;
	                }
	                else {
	                    low = mid + 1;
	                }
	            }
	            // low is the least x for which the line offset is larger than the current offset
	            // or array.length if no line offset is larger than the current offset
	            var line = low - 1;
	            return Position.create(line, offset - lineOffsets[line]);
	        };
	        FullTextDocument.prototype.offsetAt = function (position) {
	            var lineOffsets = this.getLineOffsets();
	            if (position.line >= lineOffsets.length) {
	                return this._content.length;
	            }
	            else if (position.line < 0) {
	                return 0;
	            }
	            var lineOffset = lineOffsets[position.line];
	            var nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : this._content.length;
	            return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
	        };
	        Object.defineProperty(FullTextDocument.prototype, "lineCount", {
	            get: function () {
	                return this.getLineOffsets().length;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        return FullTextDocument;
	    }());
	    var Is;
	    (function (Is) {
	        var toString = Object.prototype.toString;
	        function defined(value) {
	            return typeof value !== 'undefined';
	        }
	        Is.defined = defined;
	        function undefined(value) {
	            return typeof value === 'undefined';
	        }
	        Is.undefined = undefined;
	        function boolean(value) {
	            return value === true || value === false;
	        }
	        Is.boolean = boolean;
	        function string(value) {
	            return toString.call(value) === '[object String]';
	        }
	        Is.string = string;
	        function number(value) {
	            return toString.call(value) === '[object Number]';
	        }
	        Is.number = number;
	        function func(value) {
	            return toString.call(value) === '[object Function]';
	        }
	        Is.func = func;
	        function typedArray(value, check) {
	            return Array.isArray(value) && value.every(check);
	        }
	        Is.typedArray = typedArray;
	    })(Is || (Is = {}));
	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./main": 9,
		"./main.js": 9
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.id = 10;
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;


/***/ }
/******/ ])
});
