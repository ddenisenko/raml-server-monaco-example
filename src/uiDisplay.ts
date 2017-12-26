declare var RAML : any;

import {atomUiLib, atom} from "atom-web-ui";
import uiBuilder = require("./editor-tools/detailElements");

export function init() {
    RAML.Server.getConnection().onDisplayActionUI((displayData) => {
        var exports: any = {};

        ((exports, UI, IDE, UIBuilder) => {
            eval(displayData.uiCode);
        }).apply({}, [exports, atomUiLib, atom, uiBuilder]);
        
        return exports.run(displayData.initialUIState);
    });
}