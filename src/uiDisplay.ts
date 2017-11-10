declare var RAML : any;

import {atomUiLib, atom} from "atom-web-ui";

export function init() {
    RAML.Server.getConnection().onDisplayActionUI((displayData) => {
        var evalContext = {
            result: null
        };
        
        ((UI, IDE) => {            
            eval(displayData.uiCode);
        }).apply(evalContext, [atomUiLib, atom]);
        
        return Promise.resolve(evalContext.result || {});
    });
}