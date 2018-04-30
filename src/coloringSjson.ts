export const monarch = {
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
    value: /(((".*?"|'.*?')[ \t\r\n]*[^:])|((".*?"|'.*?')($)))/,
    path: /(("((http:|https:|#)\/).*?"|'((http:|https:|#)\/).*?')([ \t\r\n]*[^:]|$))/,

    tokenizer: {
        root: [
            {include: '@whitespace'},
            {include: '@comment'},
            [/%[^ ]+.*$/, 'meta.directive'],
            [/---/, 'operators.directivesEnd'],
            [/\.{3}/, 'operators.documentEnd'],
            [/[-?:](?= )/, 'operators'],
            {include: '@anchor'},
            {include: '@tagHandle'},
            {include: '@flowCollections'},
            [/@numberInteger(?![ \t]*\S+)/,  'number'],
            [/@numberFloat(?![ \t]*\S+)/,    'number.float'],
            [/@numberOctal(?![ \t]*\S+)/,    'number.octal'],
            [/@numberHex(?![ \t]*\S+)/,      'number.hex'],
            [/@numberInfinity(?![ \t]*\S+)/, 'number.infinity'],
            [/@numberNaN(?![ \t]*\S+)/,      'number.nan'],
            [/@numberDate(?![ \t]*\S+)/,     'number.date'],
            {include: '@flowScalars'}
        ],

        key: [
            [/((".*?")|('.*?'))(:)/, 'oas-key']
        ],

        resource: [
            [/("[\/].*?"|'.*?')(:)/, 'oas-resource']
        ],

        response: [
            [/("[0-9]*"|'[0-9]*')(:)/, 'oas-response']
        ],

        reference: [
            [/("(\$ref).*?"|'(\$ref).*?')(:)/, 'oas-reference']
        ],

        method: [
            [/("(get|post|put|patch|head|delete|options|trace|connect)"|'(get|post|put|patch|head|delete|options|trace|connect)')(:)/, 'oas-method']
        ],

        object: [
            {include: '@reference'},
            {include: '@method'},
            {include: '@resource'},
            {include: '@response'},
            {include: '@key'},
            {include: '@whitespace'},
            {include: '@comment'},
            [/\}/, '@brackets', '@pop'],
            [/,/, 'delimiter.comma'],
            [/:(?= )/, 'operators'],
            [/(?:".*?"|'.*?'|[^,\{\[]+?)(?=: )/, 'type'],
            {include: '@flowCollections'},
            {include: '@flowScalars'},
            {include: '@tagHandle'},
            {include: '@anchor'},
            {include: '@flowNumber'},
            [/[^\},]+/, {cases: {'@keywords': 'keyword', '@default': 'string'}}]
        ],

        array: [
            {include: '@whitespace'},
            {include: '@comment'},
            [/\]/, '@brackets', '@pop'],
            [/,/, 'delimiter.comma'],
            {include: '@flowCollections'},
            {include: '@flowScalars'},
            {include: '@tagHandle'},
            {include: '@anchor'},
            {include: '@flowNumber'},
            [/[^\],]+/, {cases: {'@keywords': 'keyword', '@default': 'string'}}]
        ],

        string: [
            [/[^\\"']+/, 'oas-string'],
            [/@escapes/, 'string.escape'],
            [/\\./,      'string.escape.invalid'],
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

        whitespace: [
            [/[ \t\r\n]+/, 'white']
        ],

        comment: [
            [/#.*$/, 'oas-comment']
        ],

        flowCollections: [
            [/\[/, '@brackets', '@array'],
            [/\{/, '@brackets', '@object']
        ],

        flowScalars: [
            ['@path', 'oas-path'],
            ['@value', 'oas-value']
        ],

        flowNumber: [
            [/@numberInteger(?=[ \t]*[,\]\}])/,  'number'],
            [/@numberFloat(?=[ \t]*[,\]\}])/,    'number.float'],
            [/@numberOctal(?=[ \t]*[,\]\}])/,    'number.octal'],
            [/@numberHex(?=[ \t]*[,\]\}])/,      'number.hex'],
            [/@numberInfinity(?=[ \t]*[,\]\}])/, 'number.infinity'],
            [/@numberNaN(?=[ \t]*[,\]\}])/,      'number.nan'],
            [/@numberDate(?=[ \t]*[,\]\}])/,     'number.date']
        ],

        tagHandle: [
            [/\![^ ]*/, 'oas-include']
        ],

        anchor: [
            [/[&*][^ ]+/, 'namespace']
        ]
    }
};

export default monarch;