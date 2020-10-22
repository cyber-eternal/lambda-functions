'use strict';
const minify = require('html-minifier').minify;
const beautify = require('js-beautify');
const config = require('./config');
const response = require('./response-lib');
const script = require('./JStillery/jstillery_cli');

exports.handler = async event => {
  try {
    console.log('REQUEST DATA: ', event.body);
    const body = JSON.parse(event.body || '{}');
    await dataValidation(body);
    const code = body.C;
    let result;
    if (body.A === 'M') {
      const options = config.htmlMinifierOptions;
      result = minify(code, options);
    } else if (body.A === 'B') {
      const options = config.jsBeautifyOptions;
      result = beautify[body.L](code, options);
    } else if (body.A === 'D') {
      result = await deobfuscate(code);
    }
    return response.success({ code: result });
  } catch (_e) {
    console.log('Error in handler: ', _e);
    return response.failure({ err: _e.message });
  }
};

const dataValidation = async data => {
  if (!data.A || !data.C || !data.L) throw new Error('Invalid request data');
  if (!config.actionTypes.includes(data.A)) throw new Error('Invalid action type');
  if (!config.validLanguages.includes(data.L)) throw new Error('Invalid language');
  if (data.A === 'D' && !data.L !== 'js') throw new Error('Deobfuscate work only with js code');
  return true;
};

const deobfuscate = code => {
  return new Promise(resolve => {
    const updated = script(code);
    resolve(updated);
  })
}