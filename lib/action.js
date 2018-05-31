'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = action;

var _injection = require('./injection');

function action(func, inputs, outputs) {
  inputs = (0, _injection.normalizeInputs)(func.name, inputs);
  outputs = (0, _injection.normalizeOutputs)(func.name, inputs, outputs);
  return {
    name: func.name,
    alfaAction: function alfaAction(store) {
      return function (args) {
        var input = store.get(inputs);
        if (outputs) {
          input.set = store.setWithOutputs(outputs);
        }
        var result = func(_extends({}, input, args));
        if (result && (typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
          store.set(result);
        }
      };
    }
  };
}