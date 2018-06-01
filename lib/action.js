'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = action;

var _isobject = require('isobject');

var _isobject2 = _interopRequireDefault(_isobject);

var _injection = require('./injection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function action(name, func, inputs, outputs) {
  inputs = (0, _injection.normalizeInputs)(name, inputs);
  outputs = (0, _injection.normalizeOutputs)(name, inputs, outputs);
  return {
    name: name,
    alfaAction: function alfaAction(store) {
      return function (args) {
        var input = store.get(inputs);
        if (outputs) {
          input.set = store.setWithOutputs(outputs);
        }

        var result = func(_extends({}, input, args));
        if ((0, _isobject2.default)(result)) {
          store.set(result);
        }
      };
    }
  };
}