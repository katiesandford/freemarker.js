var fmpp = require('./lib/fmpp.js');

/**
 *
 * @param {string[]} args
 * @param {Function} callback
 */
function executeFmpp(args, callback) {
    fmpp.run(args, function getFMPPResult(err, respData) {
         return callback(err, null, respData);
    });
}

/**
 * @param {Object} options
 * @param {string[]} parameterlessOptions
 */
function buildOptionArgs(options, parameterlessOptions) {
    var commandLineOptionMap = {
        locale: '-A',
        configPath: '-C',
        data: '-D',
        outputFile: '-o',
        outputDir: '-O'
    };

    var converterFunctionMap = {
        data: convertDataModel
    };

    var args = [];
    for (var option in options) {
        var param = commandLineOptionMap[option];
        if (!param) {
            throw new Error(param + " is not a valid option")
        }
        var commandLineOption = option;
        var converterFunc = converterFunctionMap[option];
        if (converterFunc) {
            commandLineOption = converterFunc(option);
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
function generateConfiguration(data, done) {
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
  return JSON.stringify(data, true, ' ');
}

/**
 *
 * @param tplPath
 * @param callback
 * @param options
 * @param parameterlessOptions
 */
function renderSingleFile(tplPath, callback, options, parameterlessOptions) {
    var args = [tplPath];
    args.push(buildOptionArgs(options, parameterlessOptions));
    executeFmpp(args, callback);
}

/**
 *
 * @param callback
 * @param options
 * @param parameterlessOptions
 */
function runFmpp(callback, options, parameterlessOptions) {
    executeFmpp(buildOptionArgs(options, parameterlessOptions), callback);
}

function getFMPPVersion(callback) {
    executeFmpp(['--version'], callback);
}

module.exports = {
    renderSingleFile: renderSingleFile,
    runFmpp: runFmpp,
    getFMPPVersion: getFMPPVersion
};
