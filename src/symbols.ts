/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

import * as ls from 'vscode-languageserver-types';

var latestStructure = null;

function calculateSymbols(model : monaco.editor.IReadOnlyModel) {

    let uri = model.uri.toString()

    if(latestStructure) {
        var result = [];
        for (let categoryName in latestStructure) {
            let vsKind : ls.SymbolKind = null;

            if ("Resources" == categoryName) {
                vsKind = ls.SymbolKind.Function
            } else if ("Resource Types & Traits" == categoryName) {
                vsKind = ls.SymbolKind.Interface;
            } else if ("Schemas & Types" == categoryName) {
                vsKind = ls.SymbolKind.Class;
            } else if ("Other" == categoryName) {
                vsKind = ls.SymbolKind.Constant;
            }

            let topLevelNode = latestStructure[categoryName];

            let items = topLevelNode.children;

            if (items) {
                result = result.concat(items.map(item=>{

                    let start = model.getPositionAt(item.start)
                    let end = model.getPositionAt(item.end)

                    let symbolInfo = {
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
                    }
                    return symbolInfo;
                }));
            }
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

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {

    RAML.Server.getConnection().onStructureReport(report=>{
        latestStructure = report.structure;
    })

    monacoEngine.languages.registerDocumentSymbolProvider(languageIdentifier, {
        provideDocumentSymbols: function(model: monaco.editor.IReadOnlyModel, token: monaco.CancellationToken) {
            return calculateSymbols(model)
        }
    });

}