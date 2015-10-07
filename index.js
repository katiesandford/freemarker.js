var fmpp = require('./lib/fmpp.js');

/**
 *
 * @param {string[]} args
 * @param {Function} callback
 */
function executeFMPP(args, callback) {
    fmpp.run(args, function getFMPPResult(err, respData) {
         return callback(err, respData);
    });
}

/**
 * @param {Object} options
 * @param {string[]} parameterlessOptions
 */
function buildOptionArgs(options, parameterlessOptions) {
    var commandLineOptionMap = {
        dataRoot: '--data-root',
        dateFormat: '--date-format',
        dateTimeFormat: '--datetime-format',
        locale: '-A',
        configPath: '-C',
        data: '-D',
        outputFile: '-o',
        outputDir: '-O',
        outputEncoding: '--output-encoding'
    };

    var converterFunctionMap = {
        data: convertDataModel
    };

    var args = [];
    for (var option in options) {
        var param = commandLineOptionMap[option];
        if (!param) {
            throw new Error(option + " is not a valid option")
        }
        var commandLineOption = options[option];
        var converterFunc = converterFunctionMap[option];
        if (converterFunc) {
            commandLineOption = converterFunc(options[option]);
        }
        args.push(param, commandLineOption);
    }
    if (parameterlessOptions) {
        args.push(parameterlessOptions)
    }
    return args;
}

/**
 * Convert Object to fmpp configuration content
 *   with TDD syntax, see also http://fmpp.sourceforge.net/tdd.html
 *
 * @param  {Object}   data resource data
 * @return {String} result
 */
function generateConfiguration(data) {
  var sName = Object.keys(data || {});
  var result = [];
  sName.forEach(function(x) {
    var value = data[x];
    if(typeof value !== 'boolean') {
      result.push(x + ': ' + value);
    } else if(value === true) {
      // For boolean settings, empty-string is considered as true
      result.push(x);
    }
  });

  return result.join('\n');
}

/**
 * Convert data object to TDD
 * @param  {Object} data
 * @return {String}      [description]
 */
function convertDataModel(data) {
  return '"' + JSON.stringify(data, true, ' ').replace(/\"/g, "").replace(/(\r\n|\n|\r)/gm,"") + '"';
}

/**
 * Renders a single ftl file
 *
 * @param {String} [tplPath]
 * @param callback
 * @param {Object} [options] - {}
 * @param {String[]} [parameterlessOptions] - []
 */
function renderSingleFile(tplPath, callback, options, parameterlessOptions) {
    var args = buildOptionArgs(options, parameterlessOptions);
    args.unshift(tplPath);
    executeFMPP(args, callback);
}

/**
 * Runs any fmpp command
 * @param callback
 * @param {Object} [options] - {}
 * @param {String[]} [parameterlessOptions] - []
 */
function runFMPP(callback, options, parameterlessOptions) {
    executeFMPP(buildOptionArgs(options, parameterlessOptions), callback);
}

/**
 * @param callback
 */
function getFMPPVersion(callback) {
    executeFMPP(['--version'], callback);
}

module.exports = {
    renderSingleFile: renderSingleFile,
    runFMPP: runFMPP,
    getFMPPVersion: getFMPPVersion
};
