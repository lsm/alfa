'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAction;

var _pipeline = require('./pipeline');

var _pipeline2 = _interopRequireDefault(_pipeline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createAction(store) {
  return function action(name, definitions, input, output) {
    if (!name || 'string' !== typeof name) throw new Error('`name` is required for creating an action.');

    var pipeline = store.get(name);
    if (pipeline) throw new Error('Action "' + name + '" already defined.');

    if (!definitions) {
      pipeline = (0, _pipeline2.default)(name, store);
    } else if ('function' === typeof definitions) {
      // Normalize definitions
      definitions = [[definitions, input, output]];
      // Add an output pipe if it's provided in this special case.
      if (output) definitions[1] = ['output', output];
    } else if (!Array.isArray(definitions)) {
      throw new TypeError('Action definitions must be function, array or undefined.');
    }

    if (!pipeline) pipeline = (0, _pipeline2.default)(name, store, definitions);

    store.set(name, pipeline);

    return pipeline;
  };
}