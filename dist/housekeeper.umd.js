(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.Housekeeper = {})));
})(this, function (exports) {
  "use strict";

  /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

  function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  var MAX_LENGTH$1 = 256;
  var MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var MAX_SAFE_COMPONENT_LENGTH$1 = 16;
  function _iterableToArrayLimit(arr, i) {
    var _i =
      null == arr
        ? null
        : ("undefined" != typeof Symbol && arr[Symbol.iterator]) ||
          arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (((_x = (_i = _i.call(arr)).next), 0 === i)) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else
          for (
            ;
            !(_n = (_s = _x.call(_i)).done) &&
            (_arr.push(_s.value), _arr.length !== i);
            _n = !0
          );
      } catch (err) {
        (_d = !0), (_e = err);
      } finally {
        try {
          if (
            !_n &&
            null != _i.return &&
            ((_r = _i.return()), Object(_r) !== _r)
          )
            return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return exports;
    };
    var exports = {},
      Op = Object.prototype,
      hasOwn = Op.hasOwnProperty,
      defineProperty =
        Object.defineProperty ||
        function (obj, key, desc) {
          obj[key] = desc.value;
        },
      $Symbol = "function" == typeof Symbol ? Symbol : {},
      iteratorSymbol = $Symbol.iterator || "@@iterator",
      asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
      toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    function define(obj, key, value) {
      return (
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        }),
        obj[key]
      );
    }
    try {
      define({}, "");
    } catch (err) {
      define = function (obj, key, value) {
        return (obj[key] = value);
      };
    }
    function wrap(innerFn, outerFn, self, tryLocsList) {
      var protoGenerator =
          outerFn && outerFn.prototype instanceof Generator
            ? outerFn
            : Generator,
        generator = Object.create(protoGenerator.prototype),
        context = new Context(tryLocsList || []);
      return (
        defineProperty(generator, "_invoke", {
          value: makeInvokeMethod(innerFn, self, context),
        }),
        generator
      );
    }
    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg),
        };
      } catch (err) {
        return {
          type: "throw",
          arg: err,
        };
      }
    }
    exports.wrap = wrap;
    var ContinueSentinel = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });
    var getProto = Object.getPrototypeOf,
      NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol) &&
      (IteratorPrototype = NativeIteratorPrototype);
    var Gp =
      (GeneratorFunctionPrototype.prototype =
      Generator.prototype =
        Object.create(IteratorPrototype));
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }
    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if ("throw" !== record.type) {
          var result = record.arg,
            value = result.value;
          return value &&
            "object" == typeof value &&
            hasOwn.call(value, "__await")
            ? PromiseImpl.resolve(value.__await).then(
                function (value) {
                  invoke("next", value, resolve, reject);
                },
                function (err) {
                  invoke("throw", err, resolve, reject);
                }
              )
            : PromiseImpl.resolve(value).then(
                function (unwrapped) {
                  (result.value = unwrapped), resolve(result);
                },
                function (error) {
                  return invoke("throw", error, resolve, reject);
                }
              );
        }
        reject(record.arg);
      }
      var previousPromise;
      defineProperty(this, "_invoke", {
        value: function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return (previousPromise = previousPromise
            ? previousPromise.then(
                callInvokeWithMethodAndArg,
                callInvokeWithMethodAndArg
              )
            : callInvokeWithMethodAndArg());
        },
      });
    }
    function makeInvokeMethod(innerFn, self, context) {
      var state = "suspendedStart";
      return function (method, arg) {
        if ("executing" === state)
          throw new Error("Generator is already running");
        if ("completed" === state) {
          if ("throw" === method) throw arg;
          return doneResult();
        }
        for (context.method = method, context.arg = arg; ; ) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }
          if ("next" === context.method)
            context.sent = context._sent = context.arg;
          else if ("throw" === context.method) {
            if ("suspendedStart" === state)
              throw ((state = "completed"), context.arg);
            context.dispatchException(context.arg);
          } else
            "return" === context.method &&
              context.abrupt("return", context.arg);
          state = "executing";
          var record = tryCatch(innerFn, self, context);
          if ("normal" === record.type) {
            if (
              ((state = context.done ? "completed" : "suspendedYield"),
              record.arg === ContinueSentinel)
            )
              continue;
            return {
              value: record.arg,
              done: context.done,
            };
          }
          "throw" === record.type &&
            ((state = "completed"),
            (context.method = "throw"),
            (context.arg = record.arg));
        }
      };
    }
    function maybeInvokeDelegate(delegate, context) {
      var methodName = context.method,
        method = delegate.iterator[methodName];
      if (undefined === method)
        return (
          (context.delegate = null),
          ("throw" === methodName &&
            delegate.iterator.return &&
            ((context.method = "return"),
            (context.arg = undefined),
            maybeInvokeDelegate(delegate, context),
            "throw" === context.method)) ||
            ("return" !== methodName &&
              ((context.method = "throw"),
              (context.arg = new TypeError(
                "The iterator does not provide a '" + methodName + "' method"
              )))),
          ContinueSentinel
        );
      var record = tryCatch(method, delegate.iterator, context.arg);
      if ("throw" === record.type)
        return (
          (context.method = "throw"),
          (context.arg = record.arg),
          (context.delegate = null),
          ContinueSentinel
        );
      var info = record.arg;
      return info
        ? info.done
          ? ((context[delegate.resultName] = info.value),
            (context.next = delegate.nextLoc),
            "return" !== context.method &&
              ((context.method = "next"), (context.arg = undefined)),
            (context.delegate = null),
            ContinueSentinel)
          : info
        : ((context.method = "throw"),
          (context.arg = new TypeError("iterator result is not an object")),
          (context.delegate = null),
          ContinueSentinel);
    }
    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0],
      };
      1 in locs && (entry.catchLoc = locs[1]),
        2 in locs && ((entry.finallyLoc = locs[2]), (entry.afterLoc = locs[3])),
        this.tryEntries.push(entry);
    }
    function resetTryEntry(entry) {
      var record = entry.completion || {};
      (record.type = "normal"), delete record.arg, (entry.completion = record);
    }
    function Context(tryLocsList) {
      (this.tryEntries = [
        {
          tryLoc: "root",
        },
      ]),
        tryLocsList.forEach(pushTryEntry, this),
        this.reset(!0);
    }
    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) return iteratorMethod.call(iterable);
        if ("function" == typeof iterable.next) return iterable;
        if (!isNaN(iterable.length)) {
          var i = -1,
            next = function next() {
              for (; ++i < iterable.length; )
                if (hasOwn.call(iterable, i))
                  return (next.value = iterable[i]), (next.done = !1), next;
              return (next.value = undefined), (next.done = !0), next;
            };
          return (next.next = next);
        }
      }
      return {
        next: doneResult,
      };
    }
    function doneResult() {
      return {
        value: undefined,
        done: !0,
      };
    }
    return (
      (GeneratorFunction.prototype = GeneratorFunctionPrototype),
      defineProperty(Gp, "constructor", {
        value: GeneratorFunctionPrototype,
        configurable: !0,
      }),
      defineProperty(GeneratorFunctionPrototype, "constructor", {
        value: GeneratorFunction,
        configurable: !0,
      }),
      (GeneratorFunction.displayName = define(
        GeneratorFunctionPrototype,
        toStringTagSymbol,
        "GeneratorFunction"
      )),
      (exports.isGeneratorFunction = function (genFun) {
        var ctor = "function" == typeof genFun && genFun.constructor;
        return (
          !!ctor &&
          (ctor === GeneratorFunction ||
            "GeneratorFunction" === (ctor.displayName || ctor.name))
        );
      }),
      (exports.mark = function (genFun) {
        return (
          Object.setPrototypeOf
            ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype)
            : ((genFun.__proto__ = GeneratorFunctionPrototype),
              define(genFun, toStringTagSymbol, "GeneratorFunction")),
          (genFun.prototype = Object.create(Gp)),
          genFun
        );
      }),
      (exports.awrap = function (arg) {
        return {
          __await: arg,
        };
      }),
      defineIteratorMethods(AsyncIterator.prototype),
      define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
        return this;
      }),
      (exports.AsyncIterator = AsyncIterator),
      (exports.async = function (
        innerFn,
        outerFn,
        self,
        tryLocsList,
        PromiseImpl
      ) {
        void 0 === PromiseImpl && (PromiseImpl = Promise);
        var iter = new AsyncIterator(
          wrap(innerFn, outerFn, self, tryLocsList),
          PromiseImpl
        );
        return exports.isGeneratorFunction(outerFn)
          ? iter
          : iter.next().then(function (result) {
              return result.done ? result.value : iter.next();
            });
      }),
      defineIteratorMethods(Gp),
      define(Gp, toStringTagSymbol, "Generator"),
      define(Gp, iteratorSymbol, function () {
        return this;
      }),
      define(Gp, "toString", function () {
        return "[object Generator]";
      }),
      (exports.keys = function (val) {
        var object = Object(val),
          keys = [];
        for (var key in object) keys.push(key);
        return (
          keys.reverse(),
          function next() {
            for (; keys.length; ) {
              var key = keys.pop();
              if (key in object)
                return (next.value = key), (next.done = !1), next;
            }
            return (next.done = !0), next;
          }
        );
      }),
      (exports.values = values),
      (Context.prototype = {
        constructor: Context,
        reset: function (skipTempReset) {
          if (
            ((this.prev = 0),
            (this.next = 0),
            (this.sent = this._sent = undefined),
            (this.done = !1),
            (this.delegate = null),
            (this.method = "next"),
            (this.arg = undefined),
            this.tryEntries.forEach(resetTryEntry),
            !skipTempReset)
          )
            for (var name in this)
              "t" === name.charAt(0) &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1)) &&
                (this[name] = undefined);
        },
        stop: function () {
          this.done = !0;
          var rootRecord = this.tryEntries[0].completion;
          if ("throw" === rootRecord.type) throw rootRecord.arg;
          return this.rval;
        },
        dispatchException: function (exception) {
          if (this.done) throw exception;
          var context = this;
          function handle(loc, caught) {
            return (
              (record.type = "throw"),
              (record.arg = exception),
              (context.next = loc),
              caught && ((context.method = "next"), (context.arg = undefined)),
              !!caught
            );
          }
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i],
              record = entry.completion;
            if ("root" === entry.tryLoc) return handle("end");
            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc"),
                hasFinally = hasOwn.call(entry, "finallyLoc");
              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc)
                  return handle(entry.catchLoc, !0);
                if (this.prev < entry.finallyLoc)
                  return handle(entry.finallyLoc);
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc)
                  return handle(entry.catchLoc, !0);
              } else {
                if (!hasFinally)
                  throw new Error("try statement without catch or finally");
                if (this.prev < entry.finallyLoc)
                  return handle(entry.finallyLoc);
              }
            }
          }
        },
        abrupt: function (type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (
              entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc
            ) {
              var finallyEntry = entry;
              break;
            }
          }
          finallyEntry &&
            ("break" === type || "continue" === type) &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc &&
            (finallyEntry = null);
          var record = finallyEntry ? finallyEntry.completion : {};
          return (
            (record.type = type),
            (record.arg = arg),
            finallyEntry
              ? ((this.method = "next"),
                (this.next = finallyEntry.finallyLoc),
                ContinueSentinel)
              : this.complete(record)
          );
        },
        complete: function (record, afterLoc) {
          if ("throw" === record.type) throw record.arg;
          return (
            "break" === record.type || "continue" === record.type
              ? (this.next = record.arg)
              : "return" === record.type
              ? ((this.rval = this.arg = record.arg),
                (this.method = "return"),
                (this.next = "end"))
              : "normal" === record.type && afterLoc && (this.next = afterLoc),
            ContinueSentinel
          );
        },
        finish: function (finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc)
              return (
                this.complete(entry.completion, entry.afterLoc),
                resetTryEntry(entry),
                ContinueSentinel
              );
          }
        },
        catch: function (tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if ("throw" === record.type) {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }
          throw new Error("illegal catch attempt");
        },
        delegateYield: function (iterable, resultName, nextLoc) {
          return (
            (this.delegate = {
              iterator: values(iterable),
              resultName: resultName,
              nextLoc: nextLoc,
            }),
            "next" === this.method && (this.arg = undefined),
            ContinueSentinel
          );
        },
      }),
      exports
    );
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";
    return (
      (_typeof =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (obj) {
              return typeof obj;
            }
          : function (obj) {
              return obj &&
                "function" == typeof Symbol &&
                obj.constructor === Symbol &&
                obj !== Symbol.prototype
                ? "symbol"
                : typeof obj;
            }),
      _typeof(obj)
    );
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(
            gen,
            resolve,
            reject,
            _next,
            _throw,
            "next",
            value
          );
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false,
    });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true,
      },
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false,
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function _getPrototypeOf(o) {
          return o.__proto__ || Object.getPrototypeOf(o);
        };
    return _getPrototypeOf(o);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function _setPrototypeOf(o, p) {
          o.__proto__ = p;
          return o;
        };
    return _setPrototypeOf(o, p);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(
        Reflect.construct(Boolean, [], function () {})
      );
      return true;
    } catch (e) {
      return false;
    }
  }
  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct.bind();
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }
    return _construct.apply(null, arguments);
  }
  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }
  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;
      if (typeof Class !== "function") {
        throw new TypeError(
          "Super expression must either be null or a function"
        );
      }
      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);
        _cache.set(Class, Wrapper);
      }
      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }
      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true,
        },
      });
      return _setPrototypeOf(Wrapper, Class);
    };
    return _wrapNativeSuper(Class);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      );
    }
    return self;
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError(
        "Derived constructors may only return object or undefined"
      );
    }
    return _assertThisInitialized(self);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _slicedToArray(arr, i) {
    return (
      _arrayWithHoles(arr) ||
      _iterableToArrayLimit(arr, i) ||
      _unsupportedIterableToArray(arr, i) ||
      _nonIterableRest()
    );
  }
  function _toConsumableArray(arr) {
    return (
      _arrayWithoutHoles(arr) ||
      _iterableToArray(arr) ||
      _unsupportedIterableToArray(arr) ||
      _nonIterableSpread()
    );
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (
      (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) ||
      iter["@@iterator"] != null
    )
      return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError(
      "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
  function _nonIterableRest() {
    throw new TypeError(
      "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it =
      (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];
    if (!it) {
      if (
        Array.isArray(o) ||
        (it = _unsupportedIterableToArray(o)) ||
        (allowArrayLike && o && typeof o.length === "number")
      ) {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length)
              return {
                done: true,
              };
            return {
              done: false,
              value: o[i++],
            };
          },
          e: function (e) {
            throw e;
          },
          f: F,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      },
    };
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  var debug$1 =
    (typeof process === "undefined" ? "undefined" : _typeof(process)) ===
      "object" &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)
      ? function () {
          var _console;
          for (
            var _len = arguments.length, args = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            args[_key] = arguments[_key];
          }
          return (_console = console).error.apply(
            _console,
            ["SEMVER"].concat(args)
          );
        }
      : function () {};
  var re$1$1 = [];
  var src$1$1 = [];
  var t$1 = {};
  var R$1 = 0;
  var createToken$1 = function createToken(name, value, isGlobal) {
    var index = R$1++;
    debug$1(name, index, value);
    t$1[name] = index;
    src$1$1[index] = value;
    re$1$1[index] = new RegExp(value, isGlobal ? "g" : undefined);
  };
  createToken$1("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken$1("NUMERICIDENTIFIERLOOSE", "[0-9]+");
  createToken$1("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*");
  createToken$1(
    "MAINVERSION",
    "(".concat(src$1$1[t$1.NUMERICIDENTIFIER], ")\\.") +
      "(".concat(src$1$1[t$1.NUMERICIDENTIFIER], ")\\.") +
      "(".concat(src$1$1[t$1.NUMERICIDENTIFIER], ")")
  );
  createToken$1(
    "MAINVERSIONLOOSE",
    "(".concat(src$1$1[t$1.NUMERICIDENTIFIERLOOSE], ")\\.") +
      "(".concat(src$1$1[t$1.NUMERICIDENTIFIERLOOSE], ")\\.") +
      "(".concat(src$1$1[t$1.NUMERICIDENTIFIERLOOSE], ")")
  );
  createToken$1(
    "PRERELEASEIDENTIFIER",
    "(?:"
      .concat(src$1$1[t$1.NUMERICIDENTIFIER], "|")
      .concat(src$1$1[t$1.NONNUMERICIDENTIFIER], ")")
  );
  createToken$1(
    "PRERELEASEIDENTIFIERLOOSE",
    "(?:"
      .concat(src$1$1[t$1.NUMERICIDENTIFIERLOOSE], "|")
      .concat(src$1$1[t$1.NONNUMERICIDENTIFIER], ")")
  );
  createToken$1(
    "PRERELEASE",
    "(?:-("
      .concat(src$1$1[t$1.PRERELEASEIDENTIFIER], "(?:\\.")
      .concat(src$1$1[t$1.PRERELEASEIDENTIFIER], ")*))")
  );
  createToken$1(
    "PRERELEASELOOSE",
    "(?:-?("
      .concat(src$1$1[t$1.PRERELEASEIDENTIFIERLOOSE], "(?:\\.")
      .concat(src$1$1[t$1.PRERELEASEIDENTIFIERLOOSE], ")*))")
  );
  createToken$1("BUILDIDENTIFIER", "[0-9A-Za-z-]+");
  createToken$1(
    "BUILD",
    "(?:\\+("
      .concat(src$1$1[t$1.BUILDIDENTIFIER], "(?:\\.")
      .concat(src$1$1[t$1.BUILDIDENTIFIER], ")*))")
  );
  createToken$1(
    "FULLPLAIN",
    "v?"
      .concat(src$1$1[t$1.MAINVERSION])
      .concat(src$1$1[t$1.PRERELEASE], "?")
      .concat(src$1$1[t$1.BUILD], "?")
  );
  createToken$1("FULL", "^".concat(src$1$1[t$1.FULLPLAIN], "$"));
  createToken$1(
    "LOOSEPLAIN",
    "[v=\\s]*"
      .concat(src$1$1[t$1.MAINVERSIONLOOSE])
      .concat(src$1$1[t$1.PRERELEASELOOSE], "?")
      .concat(src$1$1[t$1.BUILD], "?")
  );
  createToken$1("LOOSE", "^".concat(src$1$1[t$1.LOOSEPLAIN], "$"));
  createToken$1("GTLT", "((?:<|>)?=?)");
  createToken$1(
    "XRANGEIDENTIFIERLOOSE",
    "".concat(src$1$1[t$1.NUMERICIDENTIFIERLOOSE], "|x|X|\\*")
  );
  createToken$1(
    "XRANGEIDENTIFIER",
    "".concat(src$1$1[t$1.NUMERICIDENTIFIER], "|x|X|\\*")
  );
  createToken$1(
    "XRANGEPLAIN",
    "[v=\\s]*(".concat(src$1$1[t$1.XRANGEIDENTIFIER], ")") +
      "(?:\\.(".concat(src$1$1[t$1.XRANGEIDENTIFIER], ")") +
      "(?:\\.(".concat(src$1$1[t$1.XRANGEIDENTIFIER], ")") +
      "(?:"
        .concat(src$1$1[t$1.PRERELEASE], ")?")
        .concat(src$1$1[t$1.BUILD], "?") +
      ")?)?"
  );
  createToken$1(
    "XRANGEPLAINLOOSE",
    "[v=\\s]*(".concat(src$1$1[t$1.XRANGEIDENTIFIERLOOSE], ")") +
      "(?:\\.(".concat(src$1$1[t$1.XRANGEIDENTIFIERLOOSE], ")") +
      "(?:\\.(".concat(src$1$1[t$1.XRANGEIDENTIFIERLOOSE], ")") +
      "(?:"
        .concat(src$1$1[t$1.PRERELEASELOOSE], ")?")
        .concat(src$1$1[t$1.BUILD], "?") +
      ")?)?"
  );
  createToken$1(
    "XRANGE",
    "^".concat(src$1$1[t$1.GTLT], "\\s*").concat(src$1$1[t$1.XRANGEPLAIN], "$")
  );
  createToken$1(
    "XRANGELOOSE",
    "^"
      .concat(src$1$1[t$1.GTLT], "\\s*")
      .concat(src$1$1[t$1.XRANGEPLAINLOOSE], "$")
  );
  createToken$1(
    "COERCE",
    ""
      .concat("(^|[^\\d])" + "(\\d{1,")
      .concat(MAX_SAFE_COMPONENT_LENGTH$1, "})") +
      "(?:\\.(\\d{1,".concat(MAX_SAFE_COMPONENT_LENGTH$1, "}))?") +
      "(?:\\.(\\d{1,".concat(MAX_SAFE_COMPONENT_LENGTH$1, "}))?") +
      "(?:$|[^\\d])"
  );
  createToken$1("COERCERTL", src$1$1[t$1.COERCE], true);
  createToken$1("LONETILDE", "(?:~>?)");
  createToken$1(
    "TILDETRIM",
    "(\\s*)".concat(src$1$1[t$1.LONETILDE], "\\s+"),
    true
  );
  var tildeTrimReplace$1 = "$1~";
  createToken$1(
    "TILDE",
    "^".concat(src$1$1[t$1.LONETILDE]).concat(src$1$1[t$1.XRANGEPLAIN], "$")
  );
  createToken$1(
    "TILDELOOSE",
    "^"
      .concat(src$1$1[t$1.LONETILDE])
      .concat(src$1$1[t$1.XRANGEPLAINLOOSE], "$")
  );
  createToken$1("LONECARET", "(?:\\^)");
  createToken$1(
    "CARETTRIM",
    "(\\s*)".concat(src$1$1[t$1.LONECARET], "\\s+"),
    true
  );
  var caretTrimReplace$1 = "$1^";
  createToken$1(
    "CARET",
    "^".concat(src$1$1[t$1.LONECARET]).concat(src$1$1[t$1.XRANGEPLAIN], "$")
  );
  createToken$1(
    "CARETLOOSE",
    "^"
      .concat(src$1$1[t$1.LONECARET])
      .concat(src$1$1[t$1.XRANGEPLAINLOOSE], "$")
  );
  createToken$1(
    "COMPARATORLOOSE",
    "^"
      .concat(src$1$1[t$1.GTLT], "\\s*(")
      .concat(src$1$1[t$1.LOOSEPLAIN], ")$|^$")
  );
  createToken$1(
    "COMPARATOR",
    "^"
      .concat(src$1$1[t$1.GTLT], "\\s*(")
      .concat(src$1$1[t$1.FULLPLAIN], ")$|^$")
  );
  createToken$1(
    "COMPARATORTRIM",
    "(\\s*)"
      .concat(src$1$1[t$1.GTLT], "\\s*(")
      .concat(src$1$1[t$1.LOOSEPLAIN], "|")
      .concat(src$1$1[t$1.XRANGEPLAIN], ")"),
    true
  );
  var comparatorTrimReplace$1 = "$1$2$3";
  createToken$1(
    "HYPHENRANGE",
    "^\\s*(".concat(src$1$1[t$1.XRANGEPLAIN], ")") +
      "\\s+-\\s+" +
      "(".concat(src$1$1[t$1.XRANGEPLAIN], ")") +
      "\\s*$"
  );
  createToken$1(
    "HYPHENRANGELOOSE",
    "^\\s*(".concat(src$1$1[t$1.XRANGEPLAINLOOSE], ")") +
      "\\s+-\\s+" +
      "(".concat(src$1$1[t$1.XRANGEPLAINLOOSE], ")") +
      "\\s*$"
  );
  createToken$1("STAR", "(<|>)?=?\\s*\\*");
  createToken$1("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken$1("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  var opts$1 = ["includePrerelease", "loose", "rtl"];
  var parseOptions$1 = function parseOptions(options) {
    return !options
      ? {}
      : _typeof(options) !== "object"
      ? {
          loose: true,
        }
      : opts$1
          .filter(function (k) {
            return options[k];
          })
          .reduce(function (o, k) {
            o[k] = true;
            return o;
          }, {});
  };
  var numeric$1 = /^[0-9]+$/;
  var compareIdentifiers$1 = function compareIdentifiers(a, b) {
    var anum = numeric$1.test(a);
    var bnum = numeric$1.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b
      ? 0
      : anum && !bnum
      ? -1
      : bnum && !anum
      ? 1
      : a < b
      ? -1
      : 1;
  };
  var SemVer$1 = (function () {
    function SemVer(version, options) {
      _classCallCheck(this, SemVer);
      options = parseOptions$1(options);
      if (version instanceof SemVer) {
        if (
          version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease
        ) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError("Invalid Version: ".concat(version));
      }
      if (version.length > MAX_LENGTH$1) {
        throw new TypeError(
          "version is longer than ".concat(MAX_LENGTH$1, " characters")
        );
      }
      debug$1("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      var m = version
        .trim()
        .match(options.loose ? re$1$1[t$1.LOOSE] : re$1$1[t$1.FULL]);
      if (!m) {
        throw new TypeError("Invalid Version: ".concat(version));
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER$1 || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER$1 || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER$1 || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map(function (id) {
          if (/^[0-9]+$/.test(id)) {
            var num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER$1) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    _createClass(SemVer, [
      {
        key: "format",
        value: function format() {
          this.version = ""
            .concat(this.major, ".")
            .concat(this.minor, ".")
            .concat(this.patch);
          if (this.prerelease.length) {
            this.version += "-".concat(this.prerelease.join("."));
          }
          return this.version;
        },
      },
      {
        key: "toString",
        value: function toString() {
          return this.version;
        },
      },
      {
        key: "compare",
        value: function compare(other) {
          debug$1("SemVer.compare", this.version, this.options, other);
          if (!(other instanceof SemVer)) {
            if (typeof other === "string" && other === this.version) {
              return 0;
            }
            other = new SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        },
      },
      {
        key: "compareMain",
        value: function compareMain(other) {
          if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
          }
          return (
            compareIdentifiers$1(this.major, other.major) ||
            compareIdentifiers$1(this.minor, other.minor) ||
            compareIdentifiers$1(this.patch, other.patch)
          );
        },
      },
      {
        key: "comparePre",
        value: function comparePre(other) {
          if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          var i = 0;
          do {
            var a = this.prerelease[i];
            var b = other.prerelease[i];
            debug$1("prerelease compare", i, a, b);
            if (a === undefined && b === undefined) {
              return 0;
            } else if (b === undefined) {
              return 1;
            } else if (a === undefined) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers$1(a, b);
            }
          } while (++i);
        },
      },
      {
        key: "compareBuild",
        value: function compareBuild(other) {
          if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
          }
          var i = 0;
          do {
            var a = this.build[i];
            var b = other.build[i];
            debug$1("prerelease compare", i, a, b);
            if (a === undefined && b === undefined) {
              return 0;
            } else if (b === undefined) {
              return 1;
            } else if (a === undefined) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers$1(a, b);
            }
          } while (++i);
        },
      },
      {
        key: "inc",
        value: function inc(release, identifier) {
          switch (release) {
            case "premajor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc("pre", identifier);
              break;
            case "preminor":
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc("pre", identifier);
              break;
            case "prepatch":
              this.prerelease.length = 0;
              this.inc("patch", identifier);
              this.inc("pre", identifier);
              break;
            case "prerelease":
              if (this.prerelease.length === 0) {
                this.inc("patch", identifier);
              }
              this.inc("pre", identifier);
              break;
            case "major":
              if (
                this.minor !== 0 ||
                this.patch !== 0 ||
                this.prerelease.length === 0
              ) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case "minor":
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case "patch":
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            case "pre":
              if (this.prerelease.length === 0) {
                this.prerelease = [0];
              } else {
                var i = this.prerelease.length;
                while (--i >= 0) {
                  if (typeof this.prerelease[i] === "number") {
                    this.prerelease[i]++;
                    i = -2;
                  }
                }
                if (i === -1) {
                  this.prerelease.push(0);
                }
              }
              if (identifier) {
                if (
                  compareIdentifiers$1(this.prerelease[0], identifier) === 0
                ) {
                  if (isNaN(this.prerelease[1])) {
                    this.prerelease = [identifier, 0];
                  }
                } else {
                  this.prerelease = [identifier, 0];
                }
              }
              break;
            default:
              throw new Error("invalid increment argument: ".concat(release));
          }
          this.format();
          this.raw = this.version;
          return this;
        },
      },
    ]);
    return SemVer;
  })();
  var parse = function parse(version, options) {
    options = parseOptions$1(options);
    if (version instanceof SemVer$1) {
      return version;
    }
    if (typeof version !== "string") {
      return null;
    }
    if (version.length > MAX_LENGTH$1) {
      return null;
    }
    var r = options.loose ? re$1$1[t$1.LOOSE] : re$1$1[t$1.FULL];
    if (!r.test(version)) {
      return null;
    }
    try {
      return new SemVer$1(version, options);
    } catch (er) {
      return null;
    }
  };
  var valid$1 = function valid(version, options) {
    var v = parse(version, options);
    return v ? v.version : null;
  };
  var clean = function clean(version, options) {
    var s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  var compare$1 = function compare(a, b, loose) {
    return new SemVer$1(a, loose).compare(new SemVer$1(b, loose));
  };
  var eq$1 = function eq(a, b, loose) {
    return compare$1(a, b, loose) === 0;
  };
  var rcompare = function rcompare(a, b, loose) {
    return compare$1(b, a, loose);
  };
  var gt$1 = function gt(a, b, loose) {
    return compare$1(a, b, loose) > 0;
  };
  var lt$1 = function lt(a, b, loose) {
    return compare$1(a, b, loose) < 0;
  };
  var neq$1 = function neq(a, b, loose) {
    return compare$1(a, b, loose) !== 0;
  };
  var gte$1 = function gte(a, b, loose) {
    return compare$1(a, b, loose) >= 0;
  };
  var lte$1 = function lte(a, b, loose) {
    return compare$1(a, b, loose) <= 0;
  };
  var cmp$1 = function cmp(a, op, b, loose) {
    switch (op) {
      case "===":
        if (_typeof(a) === "object") {
          a = a.version;
        }
        if (_typeof(b) === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (_typeof(a) === "object") {
          a = a.version;
        }
        if (_typeof(b) === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq$1(a, b, loose);
      case "!=":
        return neq$1(a, b, loose);
      case ">":
        return gt$1(a, b, loose);
      case ">=":
        return gte$1(a, b, loose);
      case "<":
        return lt$1(a, b, loose);
      case "<=":
        return lte$1(a, b, loose);
      default:
        throw new TypeError("Invalid operator: ".concat(op));
    }
  };
  var perf$1 =
    (typeof performance === "undefined"
      ? "undefined"
      : _typeof(performance)) === "object" &&
    performance &&
    typeof performance.now === "function"
      ? performance
      : Date;
  var hasAbortController$1 = typeof AbortController === "function";
  var AC$1 = hasAbortController$1
    ? AbortController
    : (function () {
        function AbortController() {
          _classCallCheck(this, AbortController);
          this.signal = new AS$1();
        }
        _createClass(AbortController, [
          {
            key: "abort",
            value: function abort() {
              this.signal.dispatchEvent("abort");
            },
          },
        ]);
        return AbortController;
      })();
  var hasAbortSignal$1 = typeof AbortSignal === "function";
  var hasACAbortSignal$1 = typeof AC$1.AbortSignal === "function";
  var AS$1 = hasAbortSignal$1
    ? AbortSignal
    : hasACAbortSignal$1
    ? AC$1.AbortController
    : (function () {
        function AbortSignal() {
          _classCallCheck(this, AbortSignal);
          this.aborted = false;
          this._listeners = [];
        }
        _createClass(AbortSignal, [
          {
            key: "dispatchEvent",
            value: function dispatchEvent(type) {
              if (type === "abort") {
                this.aborted = true;
                var e = {
                  type: type,
                  target: this,
                };
                this.onabort(e);
                this._listeners.forEach(function (f) {
                  return f(e);
                }, this);
              }
            },
          },
          {
            key: "onabort",
            value: function onabort() {},
          },
          {
            key: "addEventListener",
            value: function addEventListener(ev, fn) {
              if (ev === "abort") {
                this._listeners.push(fn);
              }
            },
          },
          {
            key: "removeEventListener",
            value: function removeEventListener(ev, fn) {
              if (ev === "abort") {
                this._listeners = this._listeners.filter(function (f) {
                  return f !== fn;
                });
              }
            },
          },
        ]);
        return AbortSignal;
      })();
  var warned$1 = new Set();
  var deprecatedOption$1 = function deprecatedOption(opt, instead) {
    var code = "LRU_CACHE_OPTION_".concat(opt);
    if (shouldWarn$1(code)) {
      warn$1(
        code,
        "".concat(opt, " option"),
        "options.".concat(instead),
        LRUCache$1
      );
    }
  };
  var deprecatedMethod$1 = function deprecatedMethod(method, instead) {
    var code = "LRU_CACHE_METHOD_".concat(method);
    if (shouldWarn$1(code)) {
      var prototype = LRUCache$1.prototype;
      var _Object$getOwnPropert = Object.getOwnPropertyDescriptor(
          prototype,
          method
        ),
        get = _Object$getOwnPropert.get;
      warn$1(
        code,
        "".concat(method, " method"),
        "cache.".concat(instead, "()"),
        get
      );
    }
  };
  var deprecatedProperty$1 = function deprecatedProperty(field, instead) {
    var code = "LRU_CACHE_PROPERTY_".concat(field);
    if (shouldWarn$1(code)) {
      var prototype = LRUCache$1.prototype;
      var _Object$getOwnPropert2 = Object.getOwnPropertyDescriptor(
          prototype,
          field
        ),
        get = _Object$getOwnPropert2.get;
      warn$1(
        code,
        "".concat(field, " property"),
        "cache.".concat(instead),
        get
      );
    }
  };
  var emitWarning$1 = function emitWarning() {
    var _process, _console;
    (typeof process === "undefined" ? "undefined" : _typeof(process)) ===
      "object" &&
    process &&
    typeof process.emitWarning === "function"
      ? (_process = process).emitWarning.apply(_process, arguments)
      : (_console = console).error.apply(_console, arguments);
  };
  var shouldWarn$1 = function shouldWarn(code) {
    return !warned$1.has(code);
  };
  var warn$1 = function warn(code, what, instead, fn) {
    warned$1.add(code);
    var msg = "The "
      .concat(what, " is deprecated. Please use ")
      .concat(instead, " instead.");
    emitWarning$1(msg, "DeprecationWarning", code, fn);
  };
  var isPosInt$1 = function isPosInt(n) {
    return n && n === Math.floor(n) && n > 0 && isFinite(n);
  };
  var getUintArray$1 = function getUintArray(max) {
    return !isPosInt$1(max)
      ? null
      : max <= Math.pow(2, 8)
      ? Uint8Array
      : max <= Math.pow(2, 16)
      ? Uint16Array
      : max <= Math.pow(2, 32)
      ? Uint32Array
      : max <= Number.MAX_SAFE_INTEGER
      ? ZeroArray$1
      : null;
  };
  var ZeroArray$1 = (function (_Array) {
    _inherits(ZeroArray, _Array);
    var _super = _createSuper(ZeroArray);
    function ZeroArray(size) {
      var _this;
      _classCallCheck(this, ZeroArray);
      _this = _super.call(this, size);
      _this.fill(0);
      return _this;
    }
    return _createClass(ZeroArray);
  })(_wrapNativeSuper(Array));
  var Stack$1 = (function () {
    function Stack(max) {
      _classCallCheck(this, Stack);
      if (max === 0) {
        return [];
      }
      var UintArray = getUintArray$1(max);
      this.heap = new UintArray(max);
      this.length = 0;
    }
    _createClass(Stack, [
      {
        key: "push",
        value: function push(n) {
          this.heap[this.length++] = n;
        },
      },
      {
        key: "pop",
        value: function pop() {
          return this.heap[--this.length];
        },
      },
    ]);
    return Stack;
  })();
  var LRUCache$1 = (function (_Symbol$iterator) {
    function LRUCache() {
      var options =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _classCallCheck(this, LRUCache);
      var _options$max = options.max,
        max = _options$max === void 0 ? 0 : _options$max,
        ttl = options.ttl,
        _options$ttlResolutio = options.ttlResolution,
        ttlResolution =
          _options$ttlResolutio === void 0 ? 1 : _options$ttlResolutio,
        ttlAutopurge = options.ttlAutopurge,
        updateAgeOnGet = options.updateAgeOnGet,
        updateAgeOnHas = options.updateAgeOnHas,
        allowStale = options.allowStale,
        dispose = options.dispose,
        disposeAfter = options.disposeAfter,
        noDisposeOnSet = options.noDisposeOnSet,
        noUpdateTTL = options.noUpdateTTL,
        _options$maxSize = options.maxSize,
        maxSize = _options$maxSize === void 0 ? 0 : _options$maxSize,
        _options$maxEntrySize = options.maxEntrySize,
        maxEntrySize =
          _options$maxEntrySize === void 0 ? 0 : _options$maxEntrySize,
        sizeCalculation = options.sizeCalculation,
        fetchMethod = options.fetchMethod,
        fetchContext = options.fetchContext,
        noDeleteOnFetchRejection = options.noDeleteOnFetchRejection,
        noDeleteOnStaleGet = options.noDeleteOnStaleGet;
      var _ref = options instanceof LRUCache ? {} : options,
        length = _ref.length,
        maxAge = _ref.maxAge,
        stale = _ref.stale;
      if (max !== 0 && !isPosInt$1(max)) {
        throw new TypeError("max option must be a nonnegative integer");
      }
      var UintArray = max ? getUintArray$1(max) : Array;
      if (!UintArray) {
        throw new Error("invalid max value: " + max);
      }
      this.max = max;
      this.maxSize = maxSize;
      this.maxEntrySize = maxEntrySize || this.maxSize;
      this.sizeCalculation = sizeCalculation || length;
      if (this.sizeCalculation) {
        if (!this.maxSize && !this.maxEntrySize) {
          throw new TypeError(
            "cannot set sizeCalculation without setting maxSize or maxEntrySize"
          );
        }
        if (typeof this.sizeCalculation !== "function") {
          throw new TypeError("sizeCalculation set to non-function");
        }
      }
      this.fetchMethod = fetchMethod || null;
      if (this.fetchMethod && typeof this.fetchMethod !== "function") {
        throw new TypeError("fetchMethod must be a function if specified");
      }
      this.fetchContext = fetchContext;
      if (!this.fetchMethod && fetchContext !== undefined) {
        throw new TypeError("cannot set fetchContext without fetchMethod");
      }
      this.keyMap = new Map();
      this.keyList = new Array(max).fill(null);
      this.valList = new Array(max).fill(null);
      this.next = new UintArray(max);
      this.prev = new UintArray(max);
      this.head = 0;
      this.tail = 0;
      this.free = new Stack$1(max);
      this.initialFill = 1;
      this.size = 0;
      if (typeof dispose === "function") {
        this.dispose = dispose;
      }
      if (typeof disposeAfter === "function") {
        this.disposeAfter = disposeAfter;
        this.disposed = [];
      } else {
        this.disposeAfter = null;
        this.disposed = null;
      }
      this.noDisposeOnSet = !!noDisposeOnSet;
      this.noUpdateTTL = !!noUpdateTTL;
      this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
      if (this.maxEntrySize !== 0) {
        if (this.maxSize !== 0) {
          if (!isPosInt$1(this.maxSize)) {
            throw new TypeError(
              "maxSize must be a positive integer if specified"
            );
          }
        }
        if (!isPosInt$1(this.maxEntrySize)) {
          throw new TypeError(
            "maxEntrySize must be a positive integer if specified"
          );
        }
        this.initializeSizeTracking();
      }
      this.allowStale = !!allowStale || !!stale;
      this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
      this.updateAgeOnGet = !!updateAgeOnGet;
      this.updateAgeOnHas = !!updateAgeOnHas;
      this.ttlResolution =
        isPosInt$1(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
      this.ttlAutopurge = !!ttlAutopurge;
      this.ttl = ttl || maxAge || 0;
      if (this.ttl) {
        if (!isPosInt$1(this.ttl)) {
          throw new TypeError("ttl must be a positive integer if specified");
        }
        this.initializeTTLTracking();
      }
      if (this.max === 0 && this.ttl === 0 && this.maxSize === 0) {
        throw new TypeError("At least one of max, maxSize, or ttl is required");
      }
      if (!this.ttlAutopurge && !this.max && !this.maxSize) {
        var code = "LRU_CACHE_UNBOUNDED";
        if (shouldWarn$1(code)) {
          warned$1.add(code);
          var msg =
            "TTL caching without ttlAutopurge, max, or maxSize can " +
            "result in unbounded memory consumption.";
          emitWarning$1(msg, "UnboundedCacheWarning", code, LRUCache);
        }
      }
      if (stale) {
        deprecatedOption$1("stale", "allowStale");
      }
      if (maxAge) {
        deprecatedOption$1("maxAge", "ttl");
      }
      if (length) {
        deprecatedOption$1("length", "sizeCalculation");
      }
    }
    _createClass(
      LRUCache,
      [
        {
          key: "getRemainingTTL",
          value: function getRemainingTTL(key) {
            return this.has(key, {
              updateAgeOnHas: false,
            })
              ? Infinity
              : 0;
          },
        },
        {
          key: "initializeTTLTracking",
          value: function initializeTTLTracking() {
            var _this2 = this;
            this.ttls = new ZeroArray$1(this.max);
            this.starts = new ZeroArray$1(this.max);
            this.setItemTTL = function (index, ttl) {
              var start =
                arguments.length > 2 && arguments[2] !== undefined
                  ? arguments[2]
                  : perf$1.now();
              _this2.starts[index] = ttl !== 0 ? start : 0;
              _this2.ttls[index] = ttl;
              if (ttl !== 0 && _this2.ttlAutopurge) {
                var t = setTimeout(function () {
                  if (_this2.isStale(index)) {
                    _this2["delete"](_this2.keyList[index]);
                  }
                }, ttl + 1);
                if (t.unref) {
                  t.unref();
                }
              }
            };
            this.updateItemAge = function (index) {
              _this2.starts[index] =
                _this2.ttls[index] !== 0 ? perf$1.now() : 0;
            };
            var cachedNow = 0;
            var getNow = function getNow() {
              var n = perf$1.now();
              if (_this2.ttlResolution > 0) {
                cachedNow = n;
                var t = setTimeout(function () {
                  return (cachedNow = 0);
                }, _this2.ttlResolution);
                if (t.unref) {
                  t.unref();
                }
              }
              return n;
            };
            this.getRemainingTTL = function (key) {
              var index = _this2.keyMap.get(key);
              if (index === undefined) {
                return 0;
              }
              return _this2.ttls[index] === 0 || _this2.starts[index] === 0
                ? Infinity
                : _this2.starts[index] +
                    _this2.ttls[index] -
                    (cachedNow || getNow());
            };
            this.isStale = function (index) {
              return (
                _this2.ttls[index] !== 0 &&
                _this2.starts[index] !== 0 &&
                (cachedNow || getNow()) - _this2.starts[index] >
                  _this2.ttls[index]
              );
            };
          },
        },
        {
          key: "updateItemAge",
          value: function updateItemAge(index) {},
        },
        {
          key: "setItemTTL",
          value: function setItemTTL(index, ttl, start) {},
        },
        {
          key: "isStale",
          value: function isStale(index) {
            return false;
          },
        },
        {
          key: "initializeSizeTracking",
          value: function initializeSizeTracking() {
            var _this3 = this;
            this.calculatedSize = 0;
            this.sizes = new ZeroArray$1(this.max);
            this.removeItemSize = function (index) {
              _this3.calculatedSize -= _this3.sizes[index];
              _this3.sizes[index] = 0;
            };
            this.requireSize = function (k, v, size, sizeCalculation) {
              if (!isPosInt$1(size)) {
                if (sizeCalculation) {
                  if (typeof sizeCalculation !== "function") {
                    throw new TypeError("sizeCalculation must be a function");
                  }
                  size = sizeCalculation(v, k);
                  if (!isPosInt$1(size)) {
                    throw new TypeError(
                      "sizeCalculation return invalid (expect positive integer)"
                    );
                  }
                } else {
                  throw new TypeError(
                    "invalid size value (must be positive integer)"
                  );
                }
              }
              return size;
            };
            this.addItemSize = function (index, size) {
              _this3.sizes[index] = size;
              var maxSize = _this3.maxSize - _this3.sizes[index];
              while (_this3.calculatedSize > maxSize) {
                _this3.evict(true);
              }
              _this3.calculatedSize += _this3.sizes[index];
            };
          },
        },
        {
          key: "removeItemSize",
          value: function removeItemSize(index) {},
        },
        {
          key: "addItemSize",
          value: function addItemSize(index, size) {},
        },
        {
          key: "requireSize",
          value: function requireSize(k, v, size, sizeCalculation) {
            if (size || sizeCalculation) {
              throw new TypeError(
                "cannot set size without setting maxSize or maxEntrySize on cache"
              );
            }
          },
        },
        {
          key: "indexes",
          value: function indexes() {
            var _this4 = this;
            var _ref2 =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : {},
              _ref2$allowStale = _ref2.allowStale,
              allowStale =
                _ref2$allowStale === void 0
                  ? this.allowStale
                  : _ref2$allowStale;
            return _regeneratorRuntime().mark(function _callee() {
              var i;
              return _regeneratorRuntime().wrap(function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      if (!_this4.size) {
                        _context.next = 15;
                        break;
                      }
                      i = _this4.tail;
                    case 2:
                      if (_this4.isValidIndex(i)) {
                        _context.next = 5;
                        break;
                      }
                      return _context.abrupt("break", 15);
                    case 5:
                      if (!(allowStale || !_this4.isStale(i))) {
                        _context.next = 8;
                        break;
                      }
                      _context.next = 8;
                      return i;
                    case 8:
                      if (!(i === _this4.head)) {
                        _context.next = 12;
                        break;
                      }
                      return _context.abrupt("break", 15);
                    case 12:
                      i = _this4.prev[i];
                    case 13:
                      _context.next = 2;
                      break;
                    case 15:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            })();
          },
        },
        {
          key: "rindexes",
          value: function rindexes() {
            var _this5 = this;
            var _ref3 =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : {},
              _ref3$allowStale = _ref3.allowStale,
              allowStale =
                _ref3$allowStale === void 0
                  ? this.allowStale
                  : _ref3$allowStale;
            return _regeneratorRuntime().mark(function _callee2() {
              var i;
              return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                while (1) {
                  switch ((_context2.prev = _context2.next)) {
                    case 0:
                      if (!_this5.size) {
                        _context2.next = 15;
                        break;
                      }
                      i = _this5.head;
                    case 2:
                      if (_this5.isValidIndex(i)) {
                        _context2.next = 5;
                        break;
                      }
                      return _context2.abrupt("break", 15);
                    case 5:
                      if (!(allowStale || !_this5.isStale(i))) {
                        _context2.next = 8;
                        break;
                      }
                      _context2.next = 8;
                      return i;
                    case 8:
                      if (!(i === _this5.tail)) {
                        _context2.next = 12;
                        break;
                      }
                      return _context2.abrupt("break", 15);
                    case 12:
                      i = _this5.next[i];
                    case 13:
                      _context2.next = 2;
                      break;
                    case 15:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            })();
          },
        },
        {
          key: "isValidIndex",
          value: function isValidIndex(index) {
            return this.keyMap.get(this.keyList[index]) === index;
          },
        },
        {
          key: "entries",
          value: _regeneratorRuntime().mark(function entries() {
            var _iterator, _step, i;
            return _regeneratorRuntime().wrap(
              function entries$(_context3) {
                while (1) {
                  switch ((_context3.prev = _context3.next)) {
                    case 0:
                      _iterator = _createForOfIteratorHelper(this.indexes());
                      _context3.prev = 1;
                      _iterator.s();
                    case 3:
                      if ((_step = _iterator.n()).done) {
                        _context3.next = 9;
                        break;
                      }
                      i = _step.value;
                      _context3.next = 7;
                      return [this.keyList[i], this.valList[i]];
                    case 7:
                      _context3.next = 3;
                      break;
                    case 9:
                      _context3.next = 14;
                      break;
                    case 11:
                      _context3.prev = 11;
                      _context3.t0 = _context3["catch"](1);
                      _iterator.e(_context3.t0);
                    case 14:
                      _context3.prev = 14;
                      _iterator.f();
                      return _context3.finish(14);
                    case 17:
                    case "end":
                      return _context3.stop();
                  }
                }
              },
              entries,
              this,
              [[1, 11, 14, 17]]
            );
          }),
        },
        {
          key: "rentries",
          value: _regeneratorRuntime().mark(function rentries() {
            var _iterator2, _step2, i;
            return _regeneratorRuntime().wrap(
              function rentries$(_context4) {
                while (1) {
                  switch ((_context4.prev = _context4.next)) {
                    case 0:
                      _iterator2 = _createForOfIteratorHelper(this.rindexes());
                      _context4.prev = 1;
                      _iterator2.s();
                    case 3:
                      if ((_step2 = _iterator2.n()).done) {
                        _context4.next = 9;
                        break;
                      }
                      i = _step2.value;
                      _context4.next = 7;
                      return [this.keyList[i], this.valList[i]];
                    case 7:
                      _context4.next = 3;
                      break;
                    case 9:
                      _context4.next = 14;
                      break;
                    case 11:
                      _context4.prev = 11;
                      _context4.t0 = _context4["catch"](1);
                      _iterator2.e(_context4.t0);
                    case 14:
                      _context4.prev = 14;
                      _iterator2.f();
                      return _context4.finish(14);
                    case 17:
                    case "end":
                      return _context4.stop();
                  }
                }
              },
              rentries,
              this,
              [[1, 11, 14, 17]]
            );
          }),
        },
        {
          key: "keys",
          value: _regeneratorRuntime().mark(function keys() {
            var _iterator3, _step3, i;
            return _regeneratorRuntime().wrap(
              function keys$(_context5) {
                while (1) {
                  switch ((_context5.prev = _context5.next)) {
                    case 0:
                      _iterator3 = _createForOfIteratorHelper(this.indexes());
                      _context5.prev = 1;
                      _iterator3.s();
                    case 3:
                      if ((_step3 = _iterator3.n()).done) {
                        _context5.next = 9;
                        break;
                      }
                      i = _step3.value;
                      _context5.next = 7;
                      return this.keyList[i];
                    case 7:
                      _context5.next = 3;
                      break;
                    case 9:
                      _context5.next = 14;
                      break;
                    case 11:
                      _context5.prev = 11;
                      _context5.t0 = _context5["catch"](1);
                      _iterator3.e(_context5.t0);
                    case 14:
                      _context5.prev = 14;
                      _iterator3.f();
                      return _context5.finish(14);
                    case 17:
                    case "end":
                      return _context5.stop();
                  }
                }
              },
              keys,
              this,
              [[1, 11, 14, 17]]
            );
          }),
        },
        {
          key: "rkeys",
          value: _regeneratorRuntime().mark(function rkeys() {
            var _iterator4, _step4, i;
            return _regeneratorRuntime().wrap(
              function rkeys$(_context6) {
                while (1) {
                  switch ((_context6.prev = _context6.next)) {
                    case 0:
                      _iterator4 = _createForOfIteratorHelper(this.rindexes());
                      _context6.prev = 1;
                      _iterator4.s();
                    case 3:
                      if ((_step4 = _iterator4.n()).done) {
                        _context6.next = 9;
                        break;
                      }
                      i = _step4.value;
                      _context6.next = 7;
                      return this.keyList[i];
                    case 7:
                      _context6.next = 3;
                      break;
                    case 9:
                      _context6.next = 14;
                      break;
                    case 11:
                      _context6.prev = 11;
                      _context6.t0 = _context6["catch"](1);
                      _iterator4.e(_context6.t0);
                    case 14:
                      _context6.prev = 14;
                      _iterator4.f();
                      return _context6.finish(14);
                    case 17:
                    case "end":
                      return _context6.stop();
                  }
                }
              },
              rkeys,
              this,
              [[1, 11, 14, 17]]
            );
          }),
        },
        {
          key: "values",
          value: _regeneratorRuntime().mark(function values() {
            var _iterator5, _step5, i;
            return _regeneratorRuntime().wrap(
              function values$(_context7) {
                while (1) {
                  switch ((_context7.prev = _context7.next)) {
                    case 0:
                      _iterator5 = _createForOfIteratorHelper(this.indexes());
                      _context7.prev = 1;
                      _iterator5.s();
                    case 3:
                      if ((_step5 = _iterator5.n()).done) {
                        _context7.next = 9;
                        break;
                      }
                      i = _step5.value;
                      _context7.next = 7;
                      return this.valList[i];
                    case 7:
                      _context7.next = 3;
                      break;
                    case 9:
                      _context7.next = 14;
                      break;
                    case 11:
                      _context7.prev = 11;
                      _context7.t0 = _context7["catch"](1);
                      _iterator5.e(_context7.t0);
                    case 14:
                      _context7.prev = 14;
                      _iterator5.f();
                      return _context7.finish(14);
                    case 17:
                    case "end":
                      return _context7.stop();
                  }
                }
              },
              values,
              this,
              [[1, 11, 14, 17]]
            );
          }),
        },
        {
          key: "rvalues",
          value: _regeneratorRuntime().mark(function rvalues() {
            var _iterator6, _step6, i;
            return _regeneratorRuntime().wrap(
              function rvalues$(_context8) {
                while (1) {
                  switch ((_context8.prev = _context8.next)) {
                    case 0:
                      _iterator6 = _createForOfIteratorHelper(this.rindexes());
                      _context8.prev = 1;
                      _iterator6.s();
                    case 3:
                      if ((_step6 = _iterator6.n()).done) {
                        _context8.next = 9;
                        break;
                      }
                      i = _step6.value;
                      _context8.next = 7;
                      return this.valList[i];
                    case 7:
                      _context8.next = 3;
                      break;
                    case 9:
                      _context8.next = 14;
                      break;
                    case 11:
                      _context8.prev = 11;
                      _context8.t0 = _context8["catch"](1);
                      _iterator6.e(_context8.t0);
                    case 14:
                      _context8.prev = 14;
                      _iterator6.f();
                      return _context8.finish(14);
                    case 17:
                    case "end":
                      return _context8.stop();
                  }
                }
              },
              rvalues,
              this,
              [[1, 11, 14, 17]]
            );
          }),
        },
        {
          key: _Symbol$iterator,
          value: function value() {
            return this.entries();
          },
        },
        {
          key: "find",
          value: function find(fn) {
            var getOptions =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {};
            var _iterator7 = _createForOfIteratorHelper(this.indexes()),
              _step7;
            try {
              for (_iterator7.s(); !(_step7 = _iterator7.n()).done; ) {
                var i = _step7.value;
                if (fn(this.valList[i], this.keyList[i], this)) {
                  return this.get(this.keyList[i], getOptions);
                }
              }
            } catch (err) {
              _iterator7.e(err);
            } finally {
              _iterator7.f();
            }
          },
        },
        {
          key: "forEach",
          value: function forEach(fn) {
            var thisp =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : this;
            var _iterator8 = _createForOfIteratorHelper(this.indexes()),
              _step8;
            try {
              for (_iterator8.s(); !(_step8 = _iterator8.n()).done; ) {
                var i = _step8.value;
                fn.call(thisp, this.valList[i], this.keyList[i], this);
              }
            } catch (err) {
              _iterator8.e(err);
            } finally {
              _iterator8.f();
            }
          },
        },
        {
          key: "rforEach",
          value: function rforEach(fn) {
            var thisp =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : this;
            var _iterator9 = _createForOfIteratorHelper(this.rindexes()),
              _step9;
            try {
              for (_iterator9.s(); !(_step9 = _iterator9.n()).done; ) {
                var i = _step9.value;
                fn.call(thisp, this.valList[i], this.keyList[i], this);
              }
            } catch (err) {
              _iterator9.e(err);
            } finally {
              _iterator9.f();
            }
          },
        },
        {
          key: "prune",
          get: function get() {
            deprecatedMethod$1("prune", "purgeStale");
            return this.purgeStale;
          },
        },
        {
          key: "purgeStale",
          value: function purgeStale() {
            var deleted = false;
            var _iterator10 = _createForOfIteratorHelper(
                this.rindexes({
                  allowStale: true,
                })
              ),
              _step10;
            try {
              for (_iterator10.s(); !(_step10 = _iterator10.n()).done; ) {
                var i = _step10.value;
                if (this.isStale(i)) {
                  this["delete"](this.keyList[i]);
                  deleted = true;
                }
              }
            } catch (err) {
              _iterator10.e(err);
            } finally {
              _iterator10.f();
            }
            return deleted;
          },
        },
        {
          key: "dump",
          value: function dump() {
            var arr = [];
            var _iterator11 = _createForOfIteratorHelper(
                this.indexes({
                  allowStale: true,
                })
              ),
              _step11;
            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done; ) {
                var i = _step11.value;
                var key = this.keyList[i];
                var v = this.valList[i];
                var value = this.isBackgroundFetch(v)
                  ? v.__staleWhileFetching
                  : v;
                var entry = {
                  value: value,
                };
                if (this.ttls) {
                  entry.ttl = this.ttls[i];
                  var age = perf$1.now() - this.starts[i];
                  entry.start = Math.floor(Date.now() - age);
                }
                if (this.sizes) {
                  entry.size = this.sizes[i];
                }
                arr.unshift([key, entry]);
              }
            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }
            return arr;
          },
        },
        {
          key: "load",
          value: function load(arr) {
            this.clear();
            var _iterator12 = _createForOfIteratorHelper(arr),
              _step12;
            try {
              for (_iterator12.s(); !(_step12 = _iterator12.n()).done; ) {
                var _step12$value = _slicedToArray(_step12.value, 2),
                  key = _step12$value[0],
                  entry = _step12$value[1];
                if (entry.start) {
                  var age = Date.now() - entry.start;
                  entry.start = perf$1.now() - age;
                }
                this.set(key, entry.value, entry);
              }
            } catch (err) {
              _iterator12.e(err);
            } finally {
              _iterator12.f();
            }
          },
        },
        {
          key: "dispose",
          value: function dispose(v, k, reason) {},
        },
        {
          key: "set",
          value: function set(k, v) {
            var _ref4 =
                arguments.length > 2 && arguments[2] !== undefined
                  ? arguments[2]
                  : {},
              _ref4$ttl = _ref4.ttl,
              ttl = _ref4$ttl === void 0 ? this.ttl : _ref4$ttl,
              start = _ref4.start,
              _ref4$noDisposeOnSet = _ref4.noDisposeOnSet,
              noDisposeOnSet =
                _ref4$noDisposeOnSet === void 0
                  ? this.noDisposeOnSet
                  : _ref4$noDisposeOnSet,
              _ref4$size = _ref4.size,
              size = _ref4$size === void 0 ? 0 : _ref4$size,
              _ref4$sizeCalculation = _ref4.sizeCalculation,
              sizeCalculation =
                _ref4$sizeCalculation === void 0
                  ? this.sizeCalculation
                  : _ref4$sizeCalculation,
              _ref4$noUpdateTTL = _ref4.noUpdateTTL,
              noUpdateTTL =
                _ref4$noUpdateTTL === void 0
                  ? this.noUpdateTTL
                  : _ref4$noUpdateTTL;
            size = this.requireSize(k, v, size, sizeCalculation);
            if (this.maxEntrySize && size > this.maxEntrySize) {
              return this;
            }
            var index = this.size === 0 ? undefined : this.keyMap.get(k);
            if (index === undefined) {
              index = this.newIndex();
              this.keyList[index] = k;
              this.valList[index] = v;
              this.keyMap.set(k, index);
              this.next[this.tail] = index;
              this.prev[index] = this.tail;
              this.tail = index;
              this.size++;
              this.addItemSize(index, size);
              noUpdateTTL = false;
            } else {
              var oldVal = this.valList[index];
              if (v !== oldVal) {
                if (this.isBackgroundFetch(oldVal)) {
                  oldVal.__abortController.abort();
                } else {
                  if (!noDisposeOnSet) {
                    this.dispose(oldVal, k, "set");
                    if (this.disposeAfter) {
                      this.disposed.push([oldVal, k, "set"]);
                    }
                  }
                }
                this.removeItemSize(index);
                this.valList[index] = v;
                this.addItemSize(index, size);
              }
              this.moveToTail(index);
            }
            if (ttl !== 0 && this.ttl === 0 && !this.ttls) {
              this.initializeTTLTracking();
            }
            if (!noUpdateTTL) {
              this.setItemTTL(index, ttl, start);
            }
            if (this.disposeAfter) {
              while (this.disposed.length) {
                this.disposeAfter.apply(
                  this,
                  _toConsumableArray(this.disposed.shift())
                );
              }
            }
            return this;
          },
        },
        {
          key: "newIndex",
          value: function newIndex() {
            if (this.size === 0) {
              return this.tail;
            }
            if (this.size === this.max && this.max !== 0) {
              return this.evict(false);
            }
            if (this.free.length !== 0) {
              return this.free.pop();
            }
            return this.initialFill++;
          },
        },
        {
          key: "pop",
          value: function pop() {
            if (this.size) {
              var val = this.valList[this.head];
              this.evict(true);
              return val;
            }
          },
        },
        {
          key: "evict",
          value: function evict(free) {
            var head = this.head;
            var k = this.keyList[head];
            var v = this.valList[head];
            if (this.isBackgroundFetch(v)) {
              v.__abortController.abort();
            } else {
              this.dispose(v, k, "evict");
              if (this.disposeAfter) {
                this.disposed.push([v, k, "evict"]);
              }
            }
            this.removeItemSize(head);
            if (free) {
              this.keyList[head] = null;
              this.valList[head] = null;
              this.free.push(head);
            }
            this.head = this.next[head];
            this.keyMap["delete"](k);
            this.size--;
            return head;
          },
        },
        {
          key: "has",
          value: function has(k) {
            var _ref5 =
                arguments.length > 1 && arguments[1] !== undefined
                  ? arguments[1]
                  : {},
              _ref5$updateAgeOnHas = _ref5.updateAgeOnHas,
              updateAgeOnHas =
                _ref5$updateAgeOnHas === void 0
                  ? this.updateAgeOnHas
                  : _ref5$updateAgeOnHas;
            var index = this.keyMap.get(k);
            if (index !== undefined) {
              if (!this.isStale(index)) {
                if (updateAgeOnHas) {
                  this.updateItemAge(index);
                }
                return true;
              }
            }
            return false;
          },
        },
        {
          key: "peek",
          value: function peek(k) {
            var _ref6 =
                arguments.length > 1 && arguments[1] !== undefined
                  ? arguments[1]
                  : {},
              _ref6$allowStale = _ref6.allowStale,
              allowStale =
                _ref6$allowStale === void 0
                  ? this.allowStale
                  : _ref6$allowStale;
            var index = this.keyMap.get(k);
            if (index !== undefined && (allowStale || !this.isStale(index))) {
              var v = this.valList[index];
              return this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
            }
          },
        },
        {
          key: "backgroundFetch",
          value: function backgroundFetch(k, index, options, context) {
            var _this6 = this;
            var v = index === undefined ? undefined : this.valList[index];
            if (this.isBackgroundFetch(v)) {
              return v;
            }
            var ac = new AC$1();
            var fetchOpts = {
              signal: ac.signal,
              options: options,
              context: context,
            };
            var cb = function cb(v) {
              if (!ac.signal.aborted) {
                _this6.set(k, v, fetchOpts.options);
              }
              return v;
            };
            var eb = function eb(er) {
              if (_this6.valList[index] === p) {
                var del =
                  !options.noDeleteOnFetchRejection ||
                  p.__staleWhileFetching === undefined;
                if (del) {
                  _this6["delete"](k);
                } else {
                  _this6.valList[index] = p.__staleWhileFetching;
                }
              }
              if (p.__returned === p) {
                throw er;
              }
            };
            var pcall = function pcall(res) {
              return res(_this6.fetchMethod(k, v, fetchOpts));
            };
            var p = new Promise(pcall).then(cb, eb);
            p.__abortController = ac;
            p.__staleWhileFetching = v;
            p.__returned = null;
            if (index === undefined) {
              this.set(k, p, fetchOpts.options);
              index = this.keyMap.get(k);
            } else {
              this.valList[index] = p;
            }
            return p;
          },
        },
        {
          key: "isBackgroundFetch",
          value: function isBackgroundFetch(p) {
            return (
              p &&
              _typeof(p) === "object" &&
              typeof p.then === "function" &&
              Object.prototype.hasOwnProperty.call(p, "__staleWhileFetching") &&
              Object.prototype.hasOwnProperty.call(p, "__returned") &&
              (p.__returned === p || p.__returned === null)
            );
          },
        },
        {
          key: "fetch",
          value: (function () {
            var _fetch = _asyncToGenerator(
              _regeneratorRuntime().mark(function _callee3(k) {
                var _ref7,
                  _ref7$allowStale,
                  allowStale,
                  _ref7$updateAgeOnGet,
                  updateAgeOnGet,
                  _ref7$noDeleteOnStale,
                  noDeleteOnStaleGet,
                  _ref7$ttl,
                  ttl,
                  _ref7$noDisposeOnSet,
                  noDisposeOnSet,
                  _ref7$size,
                  size,
                  _ref7$sizeCalculation,
                  sizeCalculation,
                  _ref7$noUpdateTTL,
                  noUpdateTTL,
                  _ref7$noDeleteOnFetch,
                  noDeleteOnFetchRejection,
                  _ref7$fetchContext,
                  fetchContext,
                  _ref7$forceRefresh,
                  forceRefresh,
                  options,
                  index,
                  p,
                  v,
                  _p,
                  _args9 = arguments;
                return _regeneratorRuntime().wrap(
                  function _callee3$(_context9) {
                    while (1) {
                      switch ((_context9.prev = _context9.next)) {
                        case 0:
                          (_ref7 =
                            _args9.length > 1 && _args9[1] !== undefined
                              ? _args9[1]
                              : {}),
                            (_ref7$allowStale = _ref7.allowStale),
                            (allowStale =
                              _ref7$allowStale === void 0
                                ? this.allowStale
                                : _ref7$allowStale),
                            (_ref7$updateAgeOnGet = _ref7.updateAgeOnGet),
                            (updateAgeOnGet =
                              _ref7$updateAgeOnGet === void 0
                                ? this.updateAgeOnGet
                                : _ref7$updateAgeOnGet),
                            (_ref7$noDeleteOnStale = _ref7.noDeleteOnStaleGet),
                            (noDeleteOnStaleGet =
                              _ref7$noDeleteOnStale === void 0
                                ? this.noDeleteOnStaleGet
                                : _ref7$noDeleteOnStale),
                            (_ref7$ttl = _ref7.ttl),
                            (ttl = _ref7$ttl === void 0 ? this.ttl : _ref7$ttl),
                            (_ref7$noDisposeOnSet = _ref7.noDisposeOnSet),
                            (noDisposeOnSet =
                              _ref7$noDisposeOnSet === void 0
                                ? this.noDisposeOnSet
                                : _ref7$noDisposeOnSet),
                            (_ref7$size = _ref7.size),
                            (size = _ref7$size === void 0 ? 0 : _ref7$size),
                            (_ref7$sizeCalculation = _ref7.sizeCalculation),
                            (sizeCalculation =
                              _ref7$sizeCalculation === void 0
                                ? this.sizeCalculation
                                : _ref7$sizeCalculation),
                            (_ref7$noUpdateTTL = _ref7.noUpdateTTL),
                            (noUpdateTTL =
                              _ref7$noUpdateTTL === void 0
                                ? this.noUpdateTTL
                                : _ref7$noUpdateTTL),
                            (_ref7$noDeleteOnFetch =
                              _ref7.noDeleteOnFetchRejection),
                            (noDeleteOnFetchRejection =
                              _ref7$noDeleteOnFetch === void 0
                                ? this.noDeleteOnFetchRejection
                                : _ref7$noDeleteOnFetch),
                            (_ref7$fetchContext = _ref7.fetchContext),
                            (fetchContext =
                              _ref7$fetchContext === void 0
                                ? this.fetchContext
                                : _ref7$fetchContext),
                            (_ref7$forceRefresh = _ref7.forceRefresh),
                            (forceRefresh =
                              _ref7$forceRefresh === void 0
                                ? false
                                : _ref7$forceRefresh);
                          if (this.fetchMethod) {
                            _context9.next = 3;
                            break;
                          }
                          return _context9.abrupt(
                            "return",
                            this.get(k, {
                              allowStale: allowStale,
                              updateAgeOnGet: updateAgeOnGet,
                              noDeleteOnStaleGet: noDeleteOnStaleGet,
                            })
                          );
                        case 3:
                          options = {
                            allowStale: allowStale,
                            updateAgeOnGet: updateAgeOnGet,
                            noDeleteOnStaleGet: noDeleteOnStaleGet,
                            ttl: ttl,
                            noDisposeOnSet: noDisposeOnSet,
                            size: size,
                            sizeCalculation: sizeCalculation,
                            noUpdateTTL: noUpdateTTL,
                            noDeleteOnFetchRejection: noDeleteOnFetchRejection,
                          };
                          index = this.keyMap.get(k);
                          if (!(index === undefined)) {
                            _context9.next = 10;
                            break;
                          }
                          p = this.backgroundFetch(
                            k,
                            index,
                            options,
                            fetchContext
                          );
                          return _context9.abrupt("return", (p.__returned = p));
                        case 10:
                          v = this.valList[index];
                          if (!this.isBackgroundFetch(v)) {
                            _context9.next = 13;
                            break;
                          }
                          return _context9.abrupt(
                            "return",
                            allowStale && v.__staleWhileFetching !== undefined
                              ? v.__staleWhileFetching
                              : (v.__returned = v)
                          );
                        case 13:
                          if (!(!forceRefresh && !this.isStale(index))) {
                            _context9.next = 17;
                            break;
                          }
                          this.moveToTail(index);
                          if (updateAgeOnGet) {
                            this.updateItemAge(index);
                          }
                          return _context9.abrupt("return", v);
                        case 17:
                          _p = this.backgroundFetch(
                            k,
                            index,
                            options,
                            fetchContext
                          );
                          return _context9.abrupt(
                            "return",
                            allowStale && _p.__staleWhileFetching !== undefined
                              ? _p.__staleWhileFetching
                              : (_p.__returned = _p)
                          );
                        case 19:
                        case "end":
                          return _context9.stop();
                      }
                    }
                  },
                  _callee3,
                  this
                );
              })
            );
            function fetch(_x) {
              return _fetch.apply(this, arguments);
            }
            return fetch;
          })(),
        },
        {
          key: "get",
          value: function get(k) {
            var _ref8 =
                arguments.length > 1 && arguments[1] !== undefined
                  ? arguments[1]
                  : {},
              _ref8$allowStale = _ref8.allowStale,
              allowStale =
                _ref8$allowStale === void 0
                  ? this.allowStale
                  : _ref8$allowStale,
              _ref8$updateAgeOnGet = _ref8.updateAgeOnGet,
              updateAgeOnGet =
                _ref8$updateAgeOnGet === void 0
                  ? this.updateAgeOnGet
                  : _ref8$updateAgeOnGet,
              _ref8$noDeleteOnStale = _ref8.noDeleteOnStaleGet,
              noDeleteOnStaleGet =
                _ref8$noDeleteOnStale === void 0
                  ? this.noDeleteOnStaleGet
                  : _ref8$noDeleteOnStale;
            var index = this.keyMap.get(k);
            if (index !== undefined) {
              var value = this.valList[index];
              var fetching = this.isBackgroundFetch(value);
              if (this.isStale(index)) {
                if (!fetching) {
                  if (!noDeleteOnStaleGet) {
                    this["delete"](k);
                  }
                  return allowStale ? value : undefined;
                } else {
                  return allowStale ? value.__staleWhileFetching : undefined;
                }
              } else {
                if (fetching) {
                  return undefined;
                }
                this.moveToTail(index);
                if (updateAgeOnGet) {
                  this.updateItemAge(index);
                }
                return value;
              }
            }
          },
        },
        {
          key: "connect",
          value: function connect(p, n) {
            this.prev[n] = p;
            this.next[p] = n;
          },
        },
        {
          key: "moveToTail",
          value: function moveToTail(index) {
            if (index !== this.tail) {
              if (index === this.head) {
                this.head = this.next[index];
              } else {
                this.connect(this.prev[index], this.next[index]);
              }
              this.connect(this.tail, index);
              this.tail = index;
            }
          },
        },
        {
          key: "del",
          get: function get() {
            deprecatedMethod$1("del", "delete");
            return this["delete"];
          },
        },
        {
          key: "delete",
          value: function _delete(k) {
            var deleted = false;
            if (this.size !== 0) {
              var index = this.keyMap.get(k);
              if (index !== undefined) {
                deleted = true;
                if (this.size === 1) {
                  this.clear();
                } else {
                  this.removeItemSize(index);
                  var v = this.valList[index];
                  if (this.isBackgroundFetch(v)) {
                    v.__abortController.abort();
                  } else {
                    this.dispose(v, k, "delete");
                    if (this.disposeAfter) {
                      this.disposed.push([v, k, "delete"]);
                    }
                  }
                  this.keyMap["delete"](k);
                  this.keyList[index] = null;
                  this.valList[index] = null;
                  if (index === this.tail) {
                    this.tail = this.prev[index];
                  } else if (index === this.head) {
                    this.head = this.next[index];
                  } else {
                    this.next[this.prev[index]] = this.next[index];
                    this.prev[this.next[index]] = this.prev[index];
                  }
                  this.size--;
                  this.free.push(index);
                }
              }
            }
            if (this.disposed) {
              while (this.disposed.length) {
                this.disposeAfter.apply(
                  this,
                  _toConsumableArray(this.disposed.shift())
                );
              }
            }
            return deleted;
          },
        },
        {
          key: "clear",
          value: function clear() {
            var _iterator13 = _createForOfIteratorHelper(
                this.rindexes({
                  allowStale: true,
                })
              ),
              _step13;
            try {
              for (_iterator13.s(); !(_step13 = _iterator13.n()).done; ) {
                var index = _step13.value;
                var v = this.valList[index];
                if (this.isBackgroundFetch(v)) {
                  v.__abortController.abort();
                } else {
                  var k = this.keyList[index];
                  this.dispose(v, k, "delete");
                  if (this.disposeAfter) {
                    this.disposed.push([v, k, "delete"]);
                  }
                }
              }
            } catch (err) {
              _iterator13.e(err);
            } finally {
              _iterator13.f();
            }
            this.keyMap.clear();
            this.valList.fill(null);
            this.keyList.fill(null);
            if (this.ttls) {
              this.ttls.fill(0);
              this.starts.fill(0);
            }
            if (this.sizes) {
              this.sizes.fill(0);
            }
            this.head = 0;
            this.tail = 0;
            this.initialFill = 1;
            this.free.length = 0;
            this.calculatedSize = 0;
            this.size = 0;
            if (this.disposed) {
              while (this.disposed.length) {
                this.disposeAfter.apply(
                  this,
                  _toConsumableArray(this.disposed.shift())
                );
              }
            }
          },
        },
        {
          key: "reset",
          get: function get() {
            deprecatedMethod$1("reset", "clear");
            return this.clear;
          },
        },
        {
          key: "length",
          get: function get() {
            deprecatedProperty$1("length", "size");
            return this.size;
          },
        },
      ],
      [
        {
          key: "AbortController",
          get: function get() {
            return AC$1;
          },
        },
        {
          key: "AbortSignal",
          get: function get() {
            return AS$1;
          },
        },
      ]
    );
    return LRUCache;
  })(Symbol.iterator);
  var lruCache$1 = LRUCache$1;
  var LRU$1 = lruCache$1;
  var Range$1 = (function () {
    function Range(range, options) {
      var _this = this;
      _classCallCheck(this, Range);
      options = parseOptions$1(options);
      if (range instanceof Range) {
        if (
          range.loose === !!options.loose &&
          range.includePrerelease === !!options.includePrerelease
        ) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator$1) {
        this.raw = range.value;
        this.set = [[range]];
        this.format();
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range;
      this.set = range
        .split("||")
        .map(function (r) {
          return _this.parseRange(r.trim());
        })
        .filter(function (c) {
          return c.length;
        });
      if (!this.set.length) {
        throw new TypeError("Invalid SemVer Range: ".concat(range));
      }
      if (this.set.length > 1) {
        var first = this.set[0];
        this.set = this.set.filter(function (c) {
          return !isNullSet$1(c[0]);
        });
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          var _iterator = _createForOfIteratorHelper(this.set),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done; ) {
              var c = _step.value;
              if (c.length === 1 && isAny$1(c[0])) {
                this.set = [c];
                break;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      }
      this.format();
    }
    _createClass(Range, [
      {
        key: "format",
        value: function format() {
          this.range = this.set
            .map(function (comps) {
              return comps.join(" ").trim();
            })
            .join("||")
            .trim();
          return this.range;
        },
      },
      {
        key: "toString",
        value: function toString() {
          return this.range;
        },
      },
      {
        key: "parseRange",
        value: function parseRange(range) {
          var _this2 = this;
          range = range.trim();
          var memoOpts = Object.keys(this.options).join(",");
          var memoKey = "parseRange:".concat(memoOpts, ":").concat(range);
          var cached = cache$2.get(memoKey);
          if (cached) {
            return cached;
          }
          var loose = this.options.loose;
          var hr = loose
            ? re$1$1[t$1.HYPHENRANGELOOSE]
            : re$1$1[t$1.HYPHENRANGE];
          range = range.replace(
            hr,
            hyphenReplace$1(this.options.includePrerelease)
          );
          debug$1("hyphen replace", range);
          range = range.replace(
            re$1$1[t$1.COMPARATORTRIM],
            comparatorTrimReplace$1
          );
          debug$1("comparator trim", range);
          range = range.replace(re$1$1[t$1.TILDETRIM], tildeTrimReplace$1);
          range = range.replace(re$1$1[t$1.CARETTRIM], caretTrimReplace$1);
          range = range.split(/\s+/).join(" ");
          var rangeList = range
            .split(" ")
            .map(function (comp) {
              return parseComparator$1(comp, _this2.options);
            })
            .join(" ")
            .split(/\s+/)
            .map(function (comp) {
              return replaceGTE0$1(comp, _this2.options);
            });
          if (loose) {
            rangeList = rangeList.filter(function (comp) {
              debug$1("loose invalid filter", comp, _this2.options);
              return !!comp.match(re$1$1[t$1.COMPARATORLOOSE]);
            });
          }
          debug$1("range list", rangeList);
          var rangeMap = new Map();
          var comparators = rangeList.map(function (comp) {
            return new Comparator$1(comp, _this2.options);
          });
          var _iterator2 = _createForOfIteratorHelper(comparators),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
              var comp = _step2.value;
              if (isNullSet$1(comp)) {
                return [comp];
              }
              rangeMap.set(comp.value, comp);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          if (rangeMap.size > 1 && rangeMap.has("")) {
            rangeMap["delete"]("");
          }
          var result = _toConsumableArray(rangeMap.values());
          cache$2.set(memoKey, result);
          return result;
        },
      },
      {
        key: "intersects",
        value: function intersects(range, options) {
          if (!(range instanceof Range)) {
            throw new TypeError("a Range is required");
          }
          return this.set.some(function (thisComparators) {
            return (
              isSatisfiable$1(thisComparators, options) &&
              range.set.some(function (rangeComparators) {
                return (
                  isSatisfiable$1(rangeComparators, options) &&
                  thisComparators.every(function (thisComparator) {
                    return rangeComparators.every(function (rangeComparator) {
                      return thisComparator.intersects(
                        rangeComparator,
                        options
                      );
                    });
                  })
                );
              })
            );
          });
        },
      },
      {
        key: "test",
        value: function test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === "string") {
            try {
              version = new SemVer$1(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (var i = 0; i < this.set.length; i++) {
            if (testSet$1(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        },
      },
    ]);
    return Range;
  })();
  var cache$2 = new LRU$1({
    max: 1000,
  });
  var isNullSet$1 = function isNullSet(c) {
    return c.value === "<0.0.0-0";
  };
  var isAny$1 = function isAny(c) {
    return c.value === "";
  };
  var isSatisfiable$1 = function isSatisfiable(comparators, options) {
    var result = true;
    var remainingComparators = comparators.slice();
    var testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every(function (otherComparator) {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  var parseComparator$1 = function parseComparator(comp, options) {
    debug$1("comp", comp, options);
    comp = replaceCarets$1(comp, options);
    debug$1("caret", comp);
    comp = replaceTildes$1(comp, options);
    debug$1("tildes", comp);
    comp = replaceXRanges$1(comp, options);
    debug$1("xrange", comp);
    comp = replaceStars$1(comp, options);
    debug$1("stars", comp);
    return comp;
  };
  var isX$1 = function isX(id) {
    return !id || id.toLowerCase() === "x" || id === "*";
  };
  var replaceTildes$1 = function replaceTildes(comp, options) {
    return comp
      .trim()
      .split(/\s+/)
      .map(function (c) {
        return replaceTilde$1(c, options);
      })
      .join(" ");
  };
  var replaceTilde$1 = function replaceTilde(comp, options) {
    var r = options.loose ? re$1$1[t$1.TILDELOOSE] : re$1$1[t$1.TILDE];
    return comp.replace(r, function (_, M, m, p, pr) {
      debug$1("tilde", comp, _, M, m, p, pr);
      var ret;
      if (isX$1(M)) {
        ret = "";
      } else if (isX$1(m)) {
        ret = ">=".concat(M, ".0.0 <").concat(+M + 1, ".0.0-0");
      } else if (isX$1(p)) {
        ret = ">="
          .concat(M, ".")
          .concat(m, ".0 <")
          .concat(M, ".")
          .concat(+m + 1, ".0-0");
      } else if (pr) {
        debug$1("replaceTilde pr", pr);
        ret = ">="
          .concat(M, ".")
          .concat(m, ".")
          .concat(p, "-")
          .concat(pr, " <")
          .concat(M, ".")
          .concat(+m + 1, ".0-0");
      } else {
        ret = ">="
          .concat(M, ".")
          .concat(m, ".")
          .concat(p, " <")
          .concat(M, ".")
          .concat(+m + 1, ".0-0");
      }
      debug$1("tilde return", ret);
      return ret;
    });
  };
  var replaceCarets$1 = function replaceCarets(comp, options) {
    return comp
      .trim()
      .split(/\s+/)
      .map(function (c) {
        return replaceCaret$1(c, options);
      })
      .join(" ");
  };
  var replaceCaret$1 = function replaceCaret(comp, options) {
    debug$1("caret", comp, options);
    var r = options.loose ? re$1$1[t$1.CARETLOOSE] : re$1$1[t$1.CARET];
    var z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, function (_, M, m, p, pr) {
      debug$1("caret", comp, _, M, m, p, pr);
      var ret;
      if (isX$1(M)) {
        ret = "";
      } else if (isX$1(m)) {
        ret = ">="
          .concat(M, ".0.0")
          .concat(z, " <")
          .concat(+M + 1, ".0.0-0");
      } else if (isX$1(p)) {
        if (M === "0") {
          ret = ">="
            .concat(M, ".")
            .concat(m, ".0")
            .concat(z, " <")
            .concat(M, ".")
            .concat(+m + 1, ".0-0");
        } else {
          ret = ">="
            .concat(M, ".")
            .concat(m, ".0")
            .concat(z, " <")
            .concat(+M + 1, ".0.0-0");
        }
      } else if (pr) {
        debug$1("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = ">="
              .concat(M, ".")
              .concat(m, ".")
              .concat(p, "-")
              .concat(pr, " <")
              .concat(M, ".")
              .concat(m, ".")
              .concat(+p + 1, "-0");
          } else {
            ret = ">="
              .concat(M, ".")
              .concat(m, ".")
              .concat(p, "-")
              .concat(pr, " <")
              .concat(M, ".")
              .concat(+m + 1, ".0-0");
          }
        } else {
          ret = ">="
            .concat(M, ".")
            .concat(m, ".")
            .concat(p, "-")
            .concat(pr, " <")
            .concat(+M + 1, ".0.0-0");
        }
      } else {
        debug$1("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = ">="
              .concat(M, ".")
              .concat(m, ".")
              .concat(p)
              .concat(z, " <")
              .concat(M, ".")
              .concat(m, ".")
              .concat(+p + 1, "-0");
          } else {
            ret = ">="
              .concat(M, ".")
              .concat(m, ".")
              .concat(p)
              .concat(z, " <")
              .concat(M, ".")
              .concat(+m + 1, ".0-0");
          }
        } else {
          ret = ">="
            .concat(M, ".")
            .concat(m, ".")
            .concat(p, " <")
            .concat(+M + 1, ".0.0-0");
        }
      }
      debug$1("caret return", ret);
      return ret;
    });
  };
  var replaceXRanges$1 = function replaceXRanges(comp, options) {
    debug$1("replaceXRanges", comp, options);
    return comp
      .split(/\s+/)
      .map(function (c) {
        return replaceXRange$1(c, options);
      })
      .join(" ");
  };
  var replaceXRange$1 = function replaceXRange(comp, options) {
    comp = comp.trim();
    var r = options.loose ? re$1$1[t$1.XRANGELOOSE] : re$1$1[t$1.XRANGE];
    return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
      debug$1("xRange", comp, ret, gtlt, M, m, p, pr);
      var xM = isX$1(M);
      var xm = xM || isX$1(m);
      var xp = xm || isX$1(p);
      var anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = ""
          .concat(gtlt + M, ".")
          .concat(m, ".")
          .concat(p)
          .concat(pr);
      } else if (xm) {
        ret = ">="
          .concat(M, ".0.0")
          .concat(pr, " <")
          .concat(+M + 1, ".0.0-0");
      } else if (xp) {
        ret = ">="
          .concat(M, ".")
          .concat(m, ".0")
          .concat(pr, " <")
          .concat(M, ".")
          .concat(+m + 1, ".0-0");
      }
      debug$1("xRange return", ret);
      return ret;
    });
  };
  var replaceStars$1 = function replaceStars(comp, options) {
    debug$1("replaceStars", comp, options);
    return comp.trim().replace(re$1$1[t$1.STAR], "");
  };
  var replaceGTE0$1 = function replaceGTE0(comp, options) {
    debug$1("replaceGTE0", comp, options);
    return comp
      .trim()
      .replace(re$1$1[options.includePrerelease ? t$1.GTE0PRE : t$1.GTE0], "");
  };
  var hyphenReplace$1 = function hyphenReplace(incPr) {
    return function ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
      if (isX$1(fM)) {
        from = "";
      } else if (isX$1(fm)) {
        from = ">=".concat(fM, ".0.0").concat(incPr ? "-0" : "");
      } else if (isX$1(fp)) {
        from = ">="
          .concat(fM, ".")
          .concat(fm, ".0")
          .concat(incPr ? "-0" : "");
      } else if (fpr) {
        from = ">=".concat(from);
      } else {
        from = ">=".concat(from).concat(incPr ? "-0" : "");
      }
      if (isX$1(tM)) {
        to = "";
      } else if (isX$1(tm)) {
        to = "<".concat(+tM + 1, ".0.0-0");
      } else if (isX$1(tp)) {
        to = "<".concat(tM, ".").concat(+tm + 1, ".0-0");
      } else if (tpr) {
        to = "<=".concat(tM, ".").concat(tm, ".").concat(tp, "-").concat(tpr);
      } else if (incPr) {
        to = "<"
          .concat(tM, ".")
          .concat(tm, ".")
          .concat(+tp + 1, "-0");
      } else {
        to = "<=".concat(to);
      }
      return "".concat(from, " ").concat(to).trim();
    };
  };
  var testSet$1 = function testSet(set, version, options) {
    for (var i = 0; i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (var _i = 0; _i < set.length; _i++) {
        debug$1(set[_i].semver);
        if (set[_i].semver === Comparator$1.ANY) {
          continue;
        }
        if (set[_i].semver.prerelease.length > 0) {
          var allowed = set[_i].semver;
          if (
            allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch
          ) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  var ANY$2$1 = Symbol("SemVer ANY");
  var Comparator$1 = (function () {
    function Comparator(comp, options) {
      _classCallCheck(this, Comparator);
      options = parseOptions$1(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      debug$1("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY$2$1) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug$1("comp", this);
    }
    _createClass(
      Comparator,
      [
        {
          key: "parse",
          value: function parse(comp) {
            var r = this.options.loose
              ? re$1$1[t$1.COMPARATORLOOSE]
              : re$1$1[t$1.COMPARATOR];
            var m = comp.match(r);
            if (!m) {
              throw new TypeError("Invalid comparator: ".concat(comp));
            }
            this.operator = m[1] !== undefined ? m[1] : "";
            if (this.operator === "=") {
              this.operator = "";
            }
            if (!m[2]) {
              this.semver = ANY$2$1;
            } else {
              this.semver = new SemVer$1(m[2], this.options.loose);
            }
          },
        },
        {
          key: "toString",
          value: function toString() {
            return this.value;
          },
        },
        {
          key: "test",
          value: function test(version) {
            debug$1("Comparator.test", version, this.options.loose);
            if (this.semver === ANY$2$1 || version === ANY$2$1) {
              return true;
            }
            if (typeof version === "string") {
              try {
                version = new SemVer$1(version, this.options);
              } catch (er) {
                return false;
              }
            }
            return cmp$1(version, this.operator, this.semver, this.options);
          },
        },
        {
          key: "intersects",
          value: function intersects(comp, options) {
            if (!(comp instanceof Comparator)) {
              throw new TypeError("a Comparator is required");
            }
            if (!options || _typeof(options) !== "object") {
              options = {
                loose: !!options,
                includePrerelease: false,
              };
            }
            if (this.operator === "") {
              if (this.value === "") {
                return true;
              }
              return new Range$1(comp.value, options).test(this.value);
            } else if (comp.operator === "") {
              if (comp.value === "") {
                return true;
              }
              return new Range$1(this.value, options).test(comp.semver);
            }
            var sameDirectionIncreasing =
              (this.operator === ">=" || this.operator === ">") &&
              (comp.operator === ">=" || comp.operator === ">");
            var sameDirectionDecreasing =
              (this.operator === "<=" || this.operator === "<") &&
              (comp.operator === "<=" || comp.operator === "<");
            var sameSemVer = this.semver.version === comp.semver.version;
            var differentDirectionsInclusive =
              (this.operator === ">=" || this.operator === "<=") &&
              (comp.operator === ">=" || comp.operator === "<=");
            var oppositeDirectionsLessThan =
              cmp$1(this.semver, "<", comp.semver, options) &&
              (this.operator === ">=" || this.operator === ">") &&
              (comp.operator === "<=" || comp.operator === "<");
            var oppositeDirectionsGreaterThan =
              cmp$1(this.semver, ">", comp.semver, options) &&
              (this.operator === "<=" || this.operator === "<") &&
              (comp.operator === ">=" || comp.operator === ">");
            return (
              sameDirectionIncreasing ||
              sameDirectionDecreasing ||
              (sameSemVer && differentDirectionsInclusive) ||
              oppositeDirectionsLessThan ||
              oppositeDirectionsGreaterThan
            );
          },
        },
      ],
      [
        {
          key: "ANY",
          get: function get() {
            return ANY$2$1;
          },
        },
      ]
    );
    return Comparator;
  })();
  var satisfies$1 = function satisfies(version, range, options) {
    try {
      range = new Range$1(range, options);
    } catch (er) {
      return false;
    }
    return range.test(version);
  };
  var validRange = function validRange(range, options) {
    try {
      return new Range$1(range, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  Comparator$1.ANY;
  Comparator$1.ANY;

  var __assign = function () {
    __assign =
      Object.assign ||
      function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  var createDefer = function () {
    var defer = {};
    defer.p = new Promise(function (resolve, reject) {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    return defer;
  };
  var isUnsupportedVersionFormat = function (v) {
    return Boolean(v && v.includes(":"));
  };
  var getVersionInfo = function (rawSpec) {
    if (isUnsupportedVersionFormat(rawSpec)) {
      throw new Error(
        'Temporarily unsupported protocols: "'.concat(rawSpec, '"')
      );
    }
    var res = { rawSpec: rawSpec };
    var spec = res.rawSpec === "" ? "latest" : res.rawSpec.trim();
    res.fetchSpec = spec;
    var version = valid$1(spec, true);
    var range = validRange(spec, true);
    if (version) {
      res.type = "version";
    } else if (range) {
      res.type = "range";
    } else {
      res.type = "tag";
    }
    return res;
  };
  var isBefore = function (verTimes, ver, time) {
    return !verTimes || !verTimes[ver] || Date.parse(verTimes[ver]) <= time;
  };
  var avoidSemverOpt = { includePrerelease: true, loose: true };
  var shouldAvoid = function (ver, avoid) {
    return avoid && satisfies$1(ver, avoid, avoidSemverOpt);
  };
  var decorateAvoid = function (result, avoid) {
    return result && shouldAvoid(result.version, avoid)
      ? __assign(__assign({}, result), { _shouldAvoid: true })
      : result;
  };
  var engineOk = function (target, npmVer, nodeVer, force) {
    if (force === void 0) {
      force = false;
    }
    var nodev = force ? null : nodeVer;
    var eng = target.engines;
    var opt = { includePrerelease: true };
    if (!eng) {
      return true;
    }
    var nodeFail = nodev && eng.node && !satisfies$1(nodev, eng.node, opt);
    var npmFail = npmVer && eng.npm && !satisfies$1(npmVer, eng.npm, opt);
    if (nodeFail || npmFail) {
      return false;
    }
    return true;
  };
  var pink = function (packument, wanted, opts) {
    var _a = opts.defaultTag,
      defaultTag = _a === void 0 ? "latest" : _a,
      _b = opts.before,
      before = _b === void 0 ? null : _b,
      _c = opts.nodeVersion,
      nodeVersion = _c === void 0 ? null : _c,
      _d = opts.npmVersion,
      npmVersion = _d === void 0 ? null : _d,
      _e = opts.includeStaged,
      includeStaged = _e === void 0 ? false : _e,
      _f = opts.avoid,
      avoid = _f === void 0 ? null : _f;
    var name = packument.name,
      verTimes = packument.time;
    var versions = packument.versions || {};
    var staged =
      (includeStaged &&
        packument.stagedVersions &&
        packument.stagedVersions.versions) ||
      {};
    var restricted =
      (packument.policyRestrictions && packument.policyRestrictions.versions) ||
      {};
    var time = before && verTimes ? +new Date(before) : Infinity;
    var spec = getVersionInfo(wanted || defaultTag);
    var type = spec.type;
    var distTags = packument["dist-tags"] || {};
    if (type !== "tag" && type !== "version" && type !== "range") {
      throw new Error("Only tag, version, and range are supported");
    }
    if (wanted && type === "tag") {
      var ver = distTags[wanted];
      if (isBefore(verTimes, ver, time)) {
        return decorateAvoid(
          versions[ver] || staged[ver] || restricted[ver],
          avoid
        );
      } else {
        return pink(packument, "<=".concat(ver), opts);
      }
    }
    if (wanted && type === "version") {
      var ver = clean(wanted, { loose: true });
      var mani = versions[ver] || staged[ver] || restricted[ver];
      return isBefore(verTimes, ver, time) ? decorateAvoid(mani, avoid) : null;
    }
    var range = type === "range" ? wanted : "*";
    var defaultVer = distTags[defaultTag];
    if (
      defaultVer &&
      (range === "*" || satisfies$1(defaultVer, range, { loose: true })) &&
      !shouldAvoid(defaultVer, avoid)
    ) {
      var mani = versions[defaultVer];
      if (mani && isBefore(verTimes, defaultVer, time)) {
        return mani;
      }
    }
    var allEntries = Object.entries(versions)
      .concat(Object.entries(staged))
      .concat(Object.entries(restricted))
      .filter(function (_a) {
        var ver = _a[0];
        _a[1];
        return isBefore(verTimes, ver, time);
      });
    if (!allEntries.length) {
      throw new Error("No versions available for ".concat(name));
    }
    var sortSemverOpt = { loose: true };
    var entries = allEntries
      .filter(function (_a) {
        var ver = _a[0];
        _a[1];
        return satisfies$1(ver, range, { loose: true });
      })
      .sort(function (a, b) {
        var vera = a[0],
          mania = a[1];
        var verb = b[0],
          manib = b[1];
        var notavoida = !shouldAvoid(vera, avoid);
        var notavoidb = !shouldAvoid(verb, avoid);
        var notrestra = !restricted[a];
        var notrestrb = !restricted[b];
        var notstagea = !staged[a];
        var notstageb = !staged[b];
        var notdepra = !mania.deprecated;
        var notdeprb = !manib.deprecated;
        var enginea = engineOk(mania, npmVersion, nodeVersion);
        var engineb = engineOk(manib, npmVersion, nodeVersion);
        return (
          notavoidb - notavoida ||
          notrestrb - notrestra ||
          notstageb - notstagea ||
          (notdeprb && engineb) - (notdepra && enginea) ||
          engineb - enginea ||
          notdeprb - notdepra ||
          rcompare(vera, verb, sortSemverOpt)
        );
      });
    return decorateAvoid(entries[0] && entries[0][1], avoid);
  };
  var pickCache = new Map();
  function pickManifest(packument, wanted, opts) {
    if (opts === void 0) {
      opts = {};
    }
    if (!pickCache.has(packument))
      pickCache.set(packument, Object.create(null));
    var cacheMap = pickCache.get(packument);
    if (!opts.noCache && cacheMap[wanted]) {
      return cacheMap[wanted];
    }
    var picked = pink(packument, wanted, opts);
    var policyRestrictions = packument.policyRestrictions;
    var restricted = (policyRestrictions && policyRestrictions.versions) || {};
    if (picked && !restricted[picked.version]) {
      cacheMap[wanted] = picked;
      return picked;
    }
    var _a = opts.before,
      before = _a === void 0 ? null : _a;
    var bstr = before ? new Date(before).toLocaleString() : "";
    var name = packument.name;
    var pckg =
      "".concat(name, "@").concat(wanted) +
      (before ? " with a date before ".concat(bstr) : "");
    var isForbidden = picked && !!restricted[picked.version];
    var polMsg = isForbidden
      ? policyRestrictions === null || policyRestrictions === void 0
        ? void 0
        : policyRestrictions.message
      : "";
    throw new Error(
      !isForbidden
        ? 'No matching version found for "'.concat(pckg, '".')
        : 'Could not download "'
            .concat(pckg, '" due to policy violations:\n"')
            .concat(polMsg, '"')
    );
  }
  var fullDoc = "application/json";
  var corgiDoc =
    "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
  var packumentCache = {};
  var packument = function (url, pkgName, customFetch, retry, fullMetadata) {
    if (fullMetadata === void 0) {
      fullMetadata = false;
    }
    var spec = "".concat(fullMetadata, ":").concat(url);
    if (spec in packumentCache) {
      return packumentCache[spec];
    }
    var retryTimes = 0;
    var request = function () {
      var p = customFetch(url, {
        headers: {
          accept: fullMetadata ? fullDoc : corgiDoc,
        },
      })
        .then(function (res) {
          return __awaiter(void 0, void 0, void 0, function () {
            var packument;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4, res.json()];
                case 1:
                  packument = _a.sent();
                  packument._cached = res.headers.has("x-local-cache");
                  packument._contentLength = Number(
                    res.headers.get("content-length")
                  );
                  return [2, packument];
              }
            });
          });
        })
        .catch(function (err) {
          return __awaiter(void 0, void 0, void 0, function () {
            var defer_1;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  delete packumentCache[spec];
                  if (!(err.code !== "E404" || fullMetadata)) return [3, 4];
                  if (!retry) return [3, 2];
                  defer_1 = createDefer();
                  retry(err, pkgName, ++retryTimes, function () {
                    request().then(defer_1.resolve, defer_1.reject);
                  });
                  return [4, defer_1.p];
                case 1:
                  return [2, _a.sent()];
                case 2:
                  throw err;
                case 3:
                  return [3, 5];
                case 4:
                  fullMetadata = true;
                  return [
                    2,
                    packument(url, pkgName, customFetch, retry, fullMetadata),
                  ];
                case 5:
                  return [2];
              }
            });
          });
        });
      packumentCache[spec] = p;
      return p;
    };
    return request();
  };
  function preload(pkgName, opts) {
    var _a = opts || {},
      retry = _a.retry,
      fullMetadata = _a.fullMetadata,
      _b = _a.customFetch,
      customFetch = _b === void 0 ? fetch : _b,
      _c = _a.registry,
      registry = _c === void 0 ? "https://registry.npmjs.org" : _c;
    if (!registry.endsWith("/")) registry += "/";
    return packument(
      "".concat(registry).concat(pkgName),
      pkgName,
      customFetch,
      retry,
      fullMetadata
    );
  }
  function gpi(pkgName, wanted, opts) {
    return preload(pkgName, opts).then(function (res) {
      return pickManifest(res, wanted, opts);
    });
  }

  const MAX_LENGTH = 256;
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  const MAX_SAFE_COMPONENT_LENGTH = 16;
  const debug =
    typeof process === "object" &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)
      ? (...args) => console.error("SEMVER", ...args)
      : () => {};
  const re$1 = [];
  const src$1 = [];
  const t = {};
  let R = 0;
  const createToken = (name, value, isGlobal) => {
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src$1[index] = value;
    re$1[index] = new RegExp(value, isGlobal ? "g" : undefined);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "[0-9]+");
  createToken("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*");
  createToken(
    "MAINVERSION",
    `(${src$1[t.NUMERICIDENTIFIER]})\\.` +
      `(${src$1[t.NUMERICIDENTIFIER]})\\.` +
      `(${src$1[t.NUMERICIDENTIFIER]})`
  );
  createToken(
    "MAINVERSIONLOOSE",
    `(${src$1[t.NUMERICIDENTIFIERLOOSE]})\\.` +
      `(${src$1[t.NUMERICIDENTIFIERLOOSE]})\\.` +
      `(${src$1[t.NUMERICIDENTIFIERLOOSE]})`
  );
  createToken(
    "PRERELEASEIDENTIFIER",
    `(?:${src$1[t.NUMERICIDENTIFIER]}|${src$1[t.NONNUMERICIDENTIFIER]})`
  );
  createToken(
    "PRERELEASEIDENTIFIERLOOSE",
    `(?:${src$1[t.NUMERICIDENTIFIERLOOSE]}|${src$1[t.NONNUMERICIDENTIFIER]})`
  );
  createToken(
    "PRERELEASE",
    `(?:-(${src$1[t.PRERELEASEIDENTIFIER]}(?:\\.${
      src$1[t.PRERELEASEIDENTIFIER]
    })*))`
  );
  createToken(
    "PRERELEASELOOSE",
    `(?:-?(${src$1[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${
      src$1[t.PRERELEASEIDENTIFIERLOOSE]
    })*))`
  );
  createToken("BUILDIDENTIFIER", "[0-9A-Za-z-]+");
  createToken(
    "BUILD",
    `(?:\\+(${src$1[t.BUILDIDENTIFIER]}(?:\\.${src$1[t.BUILDIDENTIFIER]})*))`
  );
  createToken(
    "FULLPLAIN",
    `v?${src$1[t.MAINVERSION]}${src$1[t.PRERELEASE]}?${src$1[t.BUILD]}?`
  );
  createToken("FULL", `^${src$1[t.FULLPLAIN]}$`);
  createToken(
    "LOOSEPLAIN",
    `[v=\\s]*${src$1[t.MAINVERSIONLOOSE]}${src$1[t.PRERELEASELOOSE]}?${
      src$1[t.BUILD]
    }?`
  );
  createToken("LOOSE", `^${src$1[t.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken(
    "XRANGEIDENTIFIERLOOSE",
    `${src$1[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`
  );
  createToken("XRANGEIDENTIFIER", `${src$1[t.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken(
    "XRANGEPLAIN",
    `[v=\\s]*(${src$1[t.XRANGEIDENTIFIER]})` +
      `(?:\\.(${src$1[t.XRANGEIDENTIFIER]})` +
      `(?:\\.(${src$1[t.XRANGEIDENTIFIER]})` +
      `(?:${src$1[t.PRERELEASE]})?${src$1[t.BUILD]}?` +
      `)?)?`
  );
  createToken(
    "XRANGEPLAINLOOSE",
    `[v=\\s]*(${src$1[t.XRANGEIDENTIFIERLOOSE]})` +
      `(?:\\.(${src$1[t.XRANGEIDENTIFIERLOOSE]})` +
      `(?:\\.(${src$1[t.XRANGEIDENTIFIERLOOSE]})` +
      `(?:${src$1[t.PRERELEASELOOSE]})?${src$1[t.BUILD]}?` +
      `)?)?`
  );
  createToken("XRANGE", `^${src$1[t.GTLT]}\\s*${src$1[t.XRANGEPLAIN]}$`);
  createToken(
    "XRANGELOOSE",
    `^${src$1[t.GTLT]}\\s*${src$1[t.XRANGEPLAINLOOSE]}$`
  );
  createToken(
    "COERCE",
    `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` +
      `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
      `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
      `(?:$|[^\\d])`
  );
  createToken("COERCERTL", src$1[t.COERCE], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src$1[t.LONETILDE]}\\s+`, true);
  const tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src$1[t.LONETILDE]}${src$1[t.XRANGEPLAIN]}$`);
  createToken(
    "TILDELOOSE",
    `^${src$1[t.LONETILDE]}${src$1[t.XRANGEPLAINLOOSE]}$`
  );
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src$1[t.LONECARET]}\\s+`, true);
  const caretTrimReplace = "$1^";
  createToken("CARET", `^${src$1[t.LONECARET]}${src$1[t.XRANGEPLAIN]}$`);
  createToken(
    "CARETLOOSE",
    `^${src$1[t.LONECARET]}${src$1[t.XRANGEPLAINLOOSE]}$`
  );
  createToken(
    "COMPARATORLOOSE",
    `^${src$1[t.GTLT]}\\s*(${src$1[t.LOOSEPLAIN]})$|^$`
  );
  createToken("COMPARATOR", `^${src$1[t.GTLT]}\\s*(${src$1[t.FULLPLAIN]})$|^$`);
  createToken(
    "COMPARATORTRIM",
    `(\\s*)${src$1[t.GTLT]}\\s*(${src$1[t.LOOSEPLAIN]}|${
      src$1[t.XRANGEPLAIN]
    })`,
    true
  );
  const comparatorTrimReplace = "$1$2$3";
  createToken(
    "HYPHENRANGE",
    `^\\s*(${src$1[t.XRANGEPLAIN]})` +
      `\\s+-\\s+` +
      `(${src$1[t.XRANGEPLAIN]})` +
      `\\s*$`
  );
  createToken(
    "HYPHENRANGELOOSE",
    `^\\s*(${src$1[t.XRANGEPLAINLOOSE]})` +
      `\\s+-\\s+` +
      `(${src$1[t.XRANGEPLAINLOOSE]})` +
      `\\s*$`
  );
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  const opts = ["includePrerelease", "loose", "rtl"];
  const parseOptions = (options) =>
    !options
      ? {}
      : typeof options !== "object"
      ? { loose: true }
      : opts
          .filter((k) => options[k])
          .reduce((o, k) => {
            o[k] = true;
            return o;
          }, {});
  const numeric = /^[0-9]+$/;
  const compareIdentifiers = (a, b) => {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b
      ? 0
      : anum && !bnum
      ? -1
      : bnum && !anum
      ? 1
      : a < b
      ? -1
      : 1;
  };
  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (
          version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease
        ) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version
        .trim()
        .match(options.loose ? re$1[t.LOOSE] : re$1[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return (
        compareIdentifiers(this.major, other.major) ||
        compareIdentifiers(this.minor, other.minor) ||
        compareIdentifiers(this.patch, other.patch)
      );
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("prerelease compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    inc(release, identifier) {
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier);
          this.inc("pre", identifier);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier);
          }
          this.inc("pre", identifier);
          break;
        case "major":
          if (
            this.minor !== 0 ||
            this.patch !== 0 ||
            this.prerelease.length === 0
          ) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre":
          if (this.prerelease.length === 0) {
            this.prerelease = [0];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              this.prerelease.push(0);
            }
          }
          if (identifier) {
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = [identifier, 0];
              }
            } else {
              this.prerelease = [identifier, 0];
            }
          }
          break;
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.format();
      this.raw = this.version;
      return this;
    }
  }
  const compare = (a, b, loose) =>
    new SemVer(a, loose).compare(new SemVer(b, loose));
  const eq = (a, b, loose) => compare(a, b, loose) === 0;
  const gt = (a, b, loose) => compare(a, b, loose) > 0;
  const lt = (a, b, loose) => compare(a, b, loose) < 0;
  const neq = (a, b, loose) => compare(a, b, loose) !== 0;
  const gte = (a, b, loose) => compare(a, b, loose) >= 0;
  const lte = (a, b, loose) => compare(a, b, loose) <= 0;
  const cmp = (a, op, b, loose) => {
    switch (op) {
      case "===":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  const perf =
    typeof performance === "object" &&
    performance &&
    typeof performance.now === "function"
      ? performance
      : Date;
  const hasAbortController = typeof AbortController === "function";
  const AC = hasAbortController
    ? AbortController
    : class AbortController {
        constructor() {
          this.signal = new AS();
        }
        abort() {
          this.signal.dispatchEvent("abort");
        }
      };
  const hasAbortSignal = typeof AbortSignal === "function";
  const hasACAbortSignal = typeof AC.AbortSignal === "function";
  const AS = hasAbortSignal
    ? AbortSignal
    : hasACAbortSignal
    ? AC.AbortController
    : class AbortSignal {
        constructor() {
          this.aborted = false;
          this._listeners = [];
        }
        dispatchEvent(type) {
          if (type === "abort") {
            this.aborted = true;
            const e = { type, target: this };
            this.onabort(e);
            this._listeners.forEach((f) => f(e), this);
          }
        }
        onabort() {}
        addEventListener(ev, fn) {
          if (ev === "abort") {
            this._listeners.push(fn);
          }
        }
        removeEventListener(ev, fn) {
          if (ev === "abort") {
            this._listeners = this._listeners.filter((f) => f !== fn);
          }
        }
      };
  const warned = new Set();
  const deprecatedOption = (opt, instead) => {
    const code = `LRU_CACHE_OPTION_${opt}`;
    if (shouldWarn(code)) {
      warn(code, `${opt} option`, `options.${instead}`, LRUCache);
    }
  };
  const deprecatedMethod = (method, instead) => {
    const code = `LRU_CACHE_METHOD_${method}`;
    if (shouldWarn(code)) {
      const { prototype } = LRUCache;
      const { get } = Object.getOwnPropertyDescriptor(prototype, method);
      warn(code, `${method} method`, `cache.${instead}()`, get);
    }
  };
  const deprecatedProperty = (field, instead) => {
    const code = `LRU_CACHE_PROPERTY_${field}`;
    if (shouldWarn(code)) {
      const { prototype } = LRUCache;
      const { get } = Object.getOwnPropertyDescriptor(prototype, field);
      warn(code, `${field} property`, `cache.${instead}`, get);
    }
  };
  const emitWarning = (...a) => {
    typeof process === "object" &&
    process &&
    typeof process.emitWarning === "function"
      ? process.emitWarning(...a)
      : console.error(...a);
  };
  const shouldWarn = (code) => !warned.has(code);
  const warn = (code, what, instead, fn) => {
    warned.add(code);
    const msg = `The ${what} is deprecated. Please use ${instead} instead.`;
    emitWarning(msg, "DeprecationWarning", code, fn);
  };
  const isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
  const getUintArray = (max) =>
    !isPosInt(max)
      ? null
      : max <= Math.pow(2, 8)
      ? Uint8Array
      : max <= Math.pow(2, 16)
      ? Uint16Array
      : max <= Math.pow(2, 32)
      ? Uint32Array
      : max <= Number.MAX_SAFE_INTEGER
      ? ZeroArray
      : null;
  class ZeroArray extends Array {
    constructor(size) {
      super(size);
      this.fill(0);
    }
  }
  class Stack {
    constructor(max) {
      if (max === 0) {
        return [];
      }
      const UintArray = getUintArray(max);
      this.heap = new UintArray(max);
      this.length = 0;
    }
    push(n) {
      this.heap[this.length++] = n;
    }
    pop() {
      return this.heap[--this.length];
    }
  }
  class LRUCache {
    constructor(options = {}) {
      const {
        max = 0,
        ttl,
        ttlResolution = 1,
        ttlAutopurge,
        updateAgeOnGet,
        updateAgeOnHas,
        allowStale,
        dispose,
        disposeAfter,
        noDisposeOnSet,
        noUpdateTTL,
        maxSize = 0,
        maxEntrySize = 0,
        sizeCalculation,
        fetchMethod,
        fetchContext,
        noDeleteOnFetchRejection,
        noDeleteOnStaleGet,
      } = options;
      const { length, maxAge, stale } =
        options instanceof LRUCache ? {} : options;
      if (max !== 0 && !isPosInt(max)) {
        throw new TypeError("max option must be a nonnegative integer");
      }
      const UintArray = max ? getUintArray(max) : Array;
      if (!UintArray) {
        throw new Error("invalid max value: " + max);
      }
      this.max = max;
      this.maxSize = maxSize;
      this.maxEntrySize = maxEntrySize || this.maxSize;
      this.sizeCalculation = sizeCalculation || length;
      if (this.sizeCalculation) {
        if (!this.maxSize && !this.maxEntrySize) {
          throw new TypeError(
            "cannot set sizeCalculation without setting maxSize or maxEntrySize"
          );
        }
        if (typeof this.sizeCalculation !== "function") {
          throw new TypeError("sizeCalculation set to non-function");
        }
      }
      this.fetchMethod = fetchMethod || null;
      if (this.fetchMethod && typeof this.fetchMethod !== "function") {
        throw new TypeError("fetchMethod must be a function if specified");
      }
      this.fetchContext = fetchContext;
      if (!this.fetchMethod && fetchContext !== undefined) {
        throw new TypeError("cannot set fetchContext without fetchMethod");
      }
      this.keyMap = new Map();
      this.keyList = new Array(max).fill(null);
      this.valList = new Array(max).fill(null);
      this.next = new UintArray(max);
      this.prev = new UintArray(max);
      this.head = 0;
      this.tail = 0;
      this.free = new Stack(max);
      this.initialFill = 1;
      this.size = 0;
      if (typeof dispose === "function") {
        this.dispose = dispose;
      }
      if (typeof disposeAfter === "function") {
        this.disposeAfter = disposeAfter;
        this.disposed = [];
      } else {
        this.disposeAfter = null;
        this.disposed = null;
      }
      this.noDisposeOnSet = !!noDisposeOnSet;
      this.noUpdateTTL = !!noUpdateTTL;
      this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
      if (this.maxEntrySize !== 0) {
        if (this.maxSize !== 0) {
          if (!isPosInt(this.maxSize)) {
            throw new TypeError(
              "maxSize must be a positive integer if specified"
            );
          }
        }
        if (!isPosInt(this.maxEntrySize)) {
          throw new TypeError(
            "maxEntrySize must be a positive integer if specified"
          );
        }
        this.initializeSizeTracking();
      }
      this.allowStale = !!allowStale || !!stale;
      this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
      this.updateAgeOnGet = !!updateAgeOnGet;
      this.updateAgeOnHas = !!updateAgeOnHas;
      this.ttlResolution =
        isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
      this.ttlAutopurge = !!ttlAutopurge;
      this.ttl = ttl || maxAge || 0;
      if (this.ttl) {
        if (!isPosInt(this.ttl)) {
          throw new TypeError("ttl must be a positive integer if specified");
        }
        this.initializeTTLTracking();
      }
      if (this.max === 0 && this.ttl === 0 && this.maxSize === 0) {
        throw new TypeError("At least one of max, maxSize, or ttl is required");
      }
      if (!this.ttlAutopurge && !this.max && !this.maxSize) {
        const code = "LRU_CACHE_UNBOUNDED";
        if (shouldWarn(code)) {
          warned.add(code);
          const msg =
            "TTL caching without ttlAutopurge, max, or maxSize can " +
            "result in unbounded memory consumption.";
          emitWarning(msg, "UnboundedCacheWarning", code, LRUCache);
        }
      }
      if (stale) {
        deprecatedOption("stale", "allowStale");
      }
      if (maxAge) {
        deprecatedOption("maxAge", "ttl");
      }
      if (length) {
        deprecatedOption("length", "sizeCalculation");
      }
    }
    getRemainingTTL(key) {
      return this.has(key, { updateAgeOnHas: false }) ? Infinity : 0;
    }
    initializeTTLTracking() {
      this.ttls = new ZeroArray(this.max);
      this.starts = new ZeroArray(this.max);
      this.setItemTTL = (index, ttl, start = perf.now()) => {
        this.starts[index] = ttl !== 0 ? start : 0;
        this.ttls[index] = ttl;
        if (ttl !== 0 && this.ttlAutopurge) {
          const t = setTimeout(() => {
            if (this.isStale(index)) {
              this.delete(this.keyList[index]);
            }
          }, ttl + 1);
          if (t.unref) {
            t.unref();
          }
        }
      };
      this.updateItemAge = (index) => {
        this.starts[index] = this.ttls[index] !== 0 ? perf.now() : 0;
      };
      let cachedNow = 0;
      const getNow = () => {
        const n = perf.now();
        if (this.ttlResolution > 0) {
          cachedNow = n;
          const t = setTimeout(() => (cachedNow = 0), this.ttlResolution);
          if (t.unref) {
            t.unref();
          }
        }
        return n;
      };
      this.getRemainingTTL = (key) => {
        const index = this.keyMap.get(key);
        if (index === undefined) {
          return 0;
        }
        return this.ttls[index] === 0 || this.starts[index] === 0
          ? Infinity
          : this.starts[index] + this.ttls[index] - (cachedNow || getNow());
      };
      this.isStale = (index) => {
        return (
          this.ttls[index] !== 0 &&
          this.starts[index] !== 0 &&
          (cachedNow || getNow()) - this.starts[index] > this.ttls[index]
        );
      };
    }
    updateItemAge(index) {}
    setItemTTL(index, ttl, start) {}
    isStale(index) {
      return false;
    }
    initializeSizeTracking() {
      this.calculatedSize = 0;
      this.sizes = new ZeroArray(this.max);
      this.removeItemSize = (index) => {
        this.calculatedSize -= this.sizes[index];
        this.sizes[index] = 0;
      };
      this.requireSize = (k, v, size, sizeCalculation) => {
        if (!isPosInt(size)) {
          if (sizeCalculation) {
            if (typeof sizeCalculation !== "function") {
              throw new TypeError("sizeCalculation must be a function");
            }
            size = sizeCalculation(v, k);
            if (!isPosInt(size)) {
              throw new TypeError(
                "sizeCalculation return invalid (expect positive integer)"
              );
            }
          } else {
            throw new TypeError(
              "invalid size value (must be positive integer)"
            );
          }
        }
        return size;
      };
      this.addItemSize = (index, size) => {
        this.sizes[index] = size;
        const maxSize = this.maxSize - this.sizes[index];
        while (this.calculatedSize > maxSize) {
          this.evict(true);
        }
        this.calculatedSize += this.sizes[index];
      };
    }
    removeItemSize(index) {}
    addItemSize(index, size) {}
    requireSize(k, v, size, sizeCalculation) {
      if (size || sizeCalculation) {
        throw new TypeError(
          "cannot set size without setting maxSize or maxEntrySize on cache"
        );
      }
    }
    *indexes({ allowStale = this.allowStale } = {}) {
      if (this.size) {
        for (let i = this.tail; true; ) {
          if (!this.isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.isStale(i)) {
            yield i;
          }
          if (i === this.head) {
            break;
          } else {
            i = this.prev[i];
          }
        }
      }
    }
    *rindexes({ allowStale = this.allowStale } = {}) {
      if (this.size) {
        for (let i = this.head; true; ) {
          if (!this.isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.isStale(i)) {
            yield i;
          }
          if (i === this.tail) {
            break;
          } else {
            i = this.next[i];
          }
        }
      }
    }
    isValidIndex(index) {
      return this.keyMap.get(this.keyList[index]) === index;
    }
    *entries() {
      for (const i of this.indexes()) {
        yield [this.keyList[i], this.valList[i]];
      }
    }
    *rentries() {
      for (const i of this.rindexes()) {
        yield [this.keyList[i], this.valList[i]];
      }
    }
    *keys() {
      for (const i of this.indexes()) {
        yield this.keyList[i];
      }
    }
    *rkeys() {
      for (const i of this.rindexes()) {
        yield this.keyList[i];
      }
    }
    *values() {
      for (const i of this.indexes()) {
        yield this.valList[i];
      }
    }
    *rvalues() {
      for (const i of this.rindexes()) {
        yield this.valList[i];
      }
    }
    [Symbol.iterator]() {
      return this.entries();
    }
    find(fn, getOptions = {}) {
      for (const i of this.indexes()) {
        if (fn(this.valList[i], this.keyList[i], this)) {
          return this.get(this.keyList[i], getOptions);
        }
      }
    }
    forEach(fn, thisp = this) {
      for (const i of this.indexes()) {
        fn.call(thisp, this.valList[i], this.keyList[i], this);
      }
    }
    rforEach(fn, thisp = this) {
      for (const i of this.rindexes()) {
        fn.call(thisp, this.valList[i], this.keyList[i], this);
      }
    }
    get prune() {
      deprecatedMethod("prune", "purgeStale");
      return this.purgeStale;
    }
    purgeStale() {
      let deleted = false;
      for (const i of this.rindexes({ allowStale: true })) {
        if (this.isStale(i)) {
          this.delete(this.keyList[i]);
          deleted = true;
        }
      }
      return deleted;
    }
    dump() {
      const arr = [];
      for (const i of this.indexes({ allowStale: true })) {
        const key = this.keyList[i];
        const v = this.valList[i];
        const value = this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        const entry = { value };
        if (this.ttls) {
          entry.ttl = this.ttls[i];
          const age = perf.now() - this.starts[i];
          entry.start = Math.floor(Date.now() - age);
        }
        if (this.sizes) {
          entry.size = this.sizes[i];
        }
        arr.unshift([key, entry]);
      }
      return arr;
    }
    load(arr) {
      this.clear();
      for (const [key, entry] of arr) {
        if (entry.start) {
          const age = Date.now() - entry.start;
          entry.start = perf.now() - age;
        }
        this.set(key, entry.value, entry);
      }
    }
    dispose(v, k, reason) {}
    set(
      k,
      v,
      {
        ttl = this.ttl,
        start,
        noDisposeOnSet = this.noDisposeOnSet,
        size = 0,
        sizeCalculation = this.sizeCalculation,
        noUpdateTTL = this.noUpdateTTL,
      } = {}
    ) {
      size = this.requireSize(k, v, size, sizeCalculation);
      if (this.maxEntrySize && size > this.maxEntrySize) {
        return this;
      }
      let index = this.size === 0 ? undefined : this.keyMap.get(k);
      if (index === undefined) {
        index = this.newIndex();
        this.keyList[index] = k;
        this.valList[index] = v;
        this.keyMap.set(k, index);
        this.next[this.tail] = index;
        this.prev[index] = this.tail;
        this.tail = index;
        this.size++;
        this.addItemSize(index, size);
        noUpdateTTL = false;
      } else {
        const oldVal = this.valList[index];
        if (v !== oldVal) {
          if (this.isBackgroundFetch(oldVal)) {
            oldVal.__abortController.abort();
          } else {
            if (!noDisposeOnSet) {
              this.dispose(oldVal, k, "set");
              if (this.disposeAfter) {
                this.disposed.push([oldVal, k, "set"]);
              }
            }
          }
          this.removeItemSize(index);
          this.valList[index] = v;
          this.addItemSize(index, size);
        }
        this.moveToTail(index);
      }
      if (ttl !== 0 && this.ttl === 0 && !this.ttls) {
        this.initializeTTLTracking();
      }
      if (!noUpdateTTL) {
        this.setItemTTL(index, ttl, start);
      }
      if (this.disposeAfter) {
        while (this.disposed.length) {
          this.disposeAfter(...this.disposed.shift());
        }
      }
      return this;
    }
    newIndex() {
      if (this.size === 0) {
        return this.tail;
      }
      if (this.size === this.max && this.max !== 0) {
        return this.evict(false);
      }
      if (this.free.length !== 0) {
        return this.free.pop();
      }
      return this.initialFill++;
    }
    pop() {
      if (this.size) {
        const val = this.valList[this.head];
        this.evict(true);
        return val;
      }
    }
    evict(free) {
      const head = this.head;
      const k = this.keyList[head];
      const v = this.valList[head];
      if (this.isBackgroundFetch(v)) {
        v.__abortController.abort();
      } else {
        this.dispose(v, k, "evict");
        if (this.disposeAfter) {
          this.disposed.push([v, k, "evict"]);
        }
      }
      this.removeItemSize(head);
      if (free) {
        this.keyList[head] = null;
        this.valList[head] = null;
        this.free.push(head);
      }
      this.head = this.next[head];
      this.keyMap.delete(k);
      this.size--;
      return head;
    }
    has(k, { updateAgeOnHas = this.updateAgeOnHas } = {}) {
      const index = this.keyMap.get(k);
      if (index !== undefined) {
        if (!this.isStale(index)) {
          if (updateAgeOnHas) {
            this.updateItemAge(index);
          }
          return true;
        }
      }
      return false;
    }
    peek(k, { allowStale = this.allowStale } = {}) {
      const index = this.keyMap.get(k);
      if (index !== undefined && (allowStale || !this.isStale(index))) {
        const v = this.valList[index];
        return this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      }
    }
    backgroundFetch(k, index, options, context) {
      const v = index === undefined ? undefined : this.valList[index];
      if (this.isBackgroundFetch(v)) {
        return v;
      }
      const ac = new AC();
      const fetchOpts = {
        signal: ac.signal,
        options,
        context,
      };
      const cb = (v) => {
        if (!ac.signal.aborted) {
          this.set(k, v, fetchOpts.options);
        }
        return v;
      };
      const eb = (er) => {
        if (this.valList[index] === p) {
          const del =
            !options.noDeleteOnFetchRejection ||
            p.__staleWhileFetching === undefined;
          if (del) {
            this.delete(k);
          } else {
            this.valList[index] = p.__staleWhileFetching;
          }
        }
        if (p.__returned === p) {
          throw er;
        }
      };
      const pcall = (res) => res(this.fetchMethod(k, v, fetchOpts));
      const p = new Promise(pcall).then(cb, eb);
      p.__abortController = ac;
      p.__staleWhileFetching = v;
      p.__returned = null;
      if (index === undefined) {
        this.set(k, p, fetchOpts.options);
        index = this.keyMap.get(k);
      } else {
        this.valList[index] = p;
      }
      return p;
    }
    isBackgroundFetch(p) {
      return (
        p &&
        typeof p === "object" &&
        typeof p.then === "function" &&
        Object.prototype.hasOwnProperty.call(p, "__staleWhileFetching") &&
        Object.prototype.hasOwnProperty.call(p, "__returned") &&
        (p.__returned === p || p.__returned === null)
      );
    }
    async fetch(
      k,
      {
        allowStale = this.allowStale,
        updateAgeOnGet = this.updateAgeOnGet,
        noDeleteOnStaleGet = this.noDeleteOnStaleGet,
        ttl = this.ttl,
        noDisposeOnSet = this.noDisposeOnSet,
        size = 0,
        sizeCalculation = this.sizeCalculation,
        noUpdateTTL = this.noUpdateTTL,
        noDeleteOnFetchRejection = this.noDeleteOnFetchRejection,
        fetchContext = this.fetchContext,
        forceRefresh = false,
      } = {}
    ) {
      if (!this.fetchMethod) {
        return this.get(k, {
          allowStale,
          updateAgeOnGet,
          noDeleteOnStaleGet,
        });
      }
      const options = {
        allowStale,
        updateAgeOnGet,
        noDeleteOnStaleGet,
        ttl,
        noDisposeOnSet,
        size,
        sizeCalculation,
        noUpdateTTL,
        noDeleteOnFetchRejection,
      };
      let index = this.keyMap.get(k);
      if (index === undefined) {
        const p = this.backgroundFetch(k, index, options, fetchContext);
        return (p.__returned = p);
      } else {
        const v = this.valList[index];
        if (this.isBackgroundFetch(v)) {
          return allowStale && v.__staleWhileFetching !== undefined
            ? v.__staleWhileFetching
            : (v.__returned = v);
        }
        if (!forceRefresh && !this.isStale(index)) {
          this.moveToTail(index);
          if (updateAgeOnGet) {
            this.updateItemAge(index);
          }
          return v;
        }
        const p = this.backgroundFetch(k, index, options, fetchContext);
        return allowStale && p.__staleWhileFetching !== undefined
          ? p.__staleWhileFetching
          : (p.__returned = p);
      }
    }
    get(
      k,
      {
        allowStale = this.allowStale,
        updateAgeOnGet = this.updateAgeOnGet,
        noDeleteOnStaleGet = this.noDeleteOnStaleGet,
      } = {}
    ) {
      const index = this.keyMap.get(k);
      if (index !== undefined) {
        const value = this.valList[index];
        const fetching = this.isBackgroundFetch(value);
        if (this.isStale(index)) {
          if (!fetching) {
            if (!noDeleteOnStaleGet) {
              this.delete(k);
            }
            return allowStale ? value : undefined;
          } else {
            return allowStale ? value.__staleWhileFetching : undefined;
          }
        } else {
          if (fetching) {
            return undefined;
          }
          this.moveToTail(index);
          if (updateAgeOnGet) {
            this.updateItemAge(index);
          }
          return value;
        }
      }
    }
    connect(p, n) {
      this.prev[n] = p;
      this.next[p] = n;
    }
    moveToTail(index) {
      if (index !== this.tail) {
        if (index === this.head) {
          this.head = this.next[index];
        } else {
          this.connect(this.prev[index], this.next[index]);
        }
        this.connect(this.tail, index);
        this.tail = index;
      }
    }
    get del() {
      deprecatedMethod("del", "delete");
      return this.delete;
    }
    delete(k) {
      let deleted = false;
      if (this.size !== 0) {
        const index = this.keyMap.get(k);
        if (index !== undefined) {
          deleted = true;
          if (this.size === 1) {
            this.clear();
          } else {
            this.removeItemSize(index);
            const v = this.valList[index];
            if (this.isBackgroundFetch(v)) {
              v.__abortController.abort();
            } else {
              this.dispose(v, k, "delete");
              if (this.disposeAfter) {
                this.disposed.push([v, k, "delete"]);
              }
            }
            this.keyMap.delete(k);
            this.keyList[index] = null;
            this.valList[index] = null;
            if (index === this.tail) {
              this.tail = this.prev[index];
            } else if (index === this.head) {
              this.head = this.next[index];
            } else {
              this.next[this.prev[index]] = this.next[index];
              this.prev[this.next[index]] = this.prev[index];
            }
            this.size--;
            this.free.push(index);
          }
        }
      }
      if (this.disposed) {
        while (this.disposed.length) {
          this.disposeAfter(...this.disposed.shift());
        }
      }
      return deleted;
    }
    clear() {
      for (const index of this.rindexes({ allowStale: true })) {
        const v = this.valList[index];
        if (this.isBackgroundFetch(v)) {
          v.__abortController.abort();
        } else {
          const k = this.keyList[index];
          this.dispose(v, k, "delete");
          if (this.disposeAfter) {
            this.disposed.push([v, k, "delete"]);
          }
        }
      }
      this.keyMap.clear();
      this.valList.fill(null);
      this.keyList.fill(null);
      if (this.ttls) {
        this.ttls.fill(0);
        this.starts.fill(0);
      }
      if (this.sizes) {
        this.sizes.fill(0);
      }
      this.head = 0;
      this.tail = 0;
      this.initialFill = 1;
      this.free.length = 0;
      this.calculatedSize = 0;
      this.size = 0;
      if (this.disposed) {
        while (this.disposed.length) {
          this.disposeAfter(...this.disposed.shift());
        }
      }
    }
    get reset() {
      deprecatedMethod("reset", "clear");
      return this.clear;
    }
    get length() {
      deprecatedProperty("length", "size");
      return this.size;
    }
    static get AbortController() {
      return AC;
    }
    static get AbortSignal() {
      return AS;
    }
  }
  var lruCache = LRUCache;
  var LRU = lruCache;
  class Range {
    constructor(range, options) {
      options = parseOptions(options);
      if (range instanceof Range) {
        if (
          range.loose === !!options.loose &&
          range.includePrerelease === !!options.includePrerelease
        ) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        this.raw = range.value;
        this.set = [[range]];
        this.format();
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range;
      this.set = range
        .split("||")
        .map((r) => this.parseRange(r.trim()))
        .filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${range}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.format();
    }
    format() {
      this.range = this.set
        .map((comps) => {
          return comps.join(" ").trim();
        })
        .join("||")
        .trim();
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range) {
      range = range.trim();
      const memoOpts = Object.keys(this.options).join(",");
      const memoKey = `parseRange:${memoOpts}:${range}`;
      const cached = cache$1.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re$1[t.HYPHENRANGELOOSE] : re$1[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range);
      range = range.replace(re$1[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range);
      range = range.replace(re$1[t.TILDETRIM], tildeTrimReplace);
      range = range.replace(re$1[t.CARETTRIM], caretTrimReplace);
      range = range.split(/\s+/).join(" ");
      let rangeList = range
        .split(" ")
        .map((comp) => parseComparator(comp, this.options))
        .join(" ")
        .split(/\s+/)
        .map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re$1[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = new Map();
      const comparators = rangeList.map(
        (comp) => new Comparator(comp, this.options)
      );
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache$1.set(memoKey, result);
      return result;
    }
    intersects(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return (
          isSatisfiable(thisComparators, options) &&
          range.set.some((rangeComparators) => {
            return (
              isSatisfiable(rangeComparators, options) &&
              thisComparators.every((thisComparator) => {
                return rangeComparators.every((rangeComparator) => {
                  return thisComparator.intersects(rangeComparator, options);
                });
              })
            );
          })
        );
      });
    }
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  const cache$1 = new LRU({ max: 1000 });
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  const parseComparator = (comp, options) => {
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  const replaceTildes = (comp, options) =>
    comp
      .trim()
      .split(/\s+/)
      .map((c) => {
        return replaceTilde(c, options);
      })
      .join(" ");
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re$1[t.TILDELOOSE] : re$1[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) =>
    comp
      .trim()
      .split(/\s+/)
      .map((c) => {
        return replaceCaret(c, options);
      })
      .join(" ");
  const replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re$1[t.CARETLOOSE] : re$1[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp
      .split(/\s+/)
      .map((c) => {
        return replaceXRange(c, options);
      })
      .join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re$1[t.XRANGELOOSE] : re$1[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re$1[t.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp
      .trim()
      .replace(re$1[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  const hyphenReplace =
    (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
  const testSet = (set, version, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (
            allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch
          ) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  const ANY$2 = Symbol("SemVer ANY");
  class Comparator {
    static get ANY() {
      return ANY$2;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY$2) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose
        ? re$1[t.COMPARATORLOOSE]
        : re$1[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== undefined ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY$2;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY$2 || version === ANY$2) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false,
        };
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      const sameDirectionIncreasing =
        (this.operator === ">=" || this.operator === ">") &&
        (comp.operator === ">=" || comp.operator === ">");
      const sameDirectionDecreasing =
        (this.operator === "<=" || this.operator === "<") &&
        (comp.operator === "<=" || comp.operator === "<");
      const sameSemVer = this.semver.version === comp.semver.version;
      const differentDirectionsInclusive =
        (this.operator === ">=" || this.operator === "<=") &&
        (comp.operator === ">=" || comp.operator === "<=");
      const oppositeDirectionsLessThan =
        cmp(this.semver, "<", comp.semver, options) &&
        (this.operator === ">=" || this.operator === ">") &&
        (comp.operator === "<=" || comp.operator === "<");
      const oppositeDirectionsGreaterThan =
        cmp(this.semver, ">", comp.semver, options) &&
        (this.operator === "<=" || this.operator === "<") &&
        (comp.operator === ">=" || comp.operator === ">");
      return (
        sameDirectionIncreasing ||
        sameDirectionDecreasing ||
        (sameSemVer && differentDirectionsInclusive) ||
        oppositeDirectionsLessThan ||
        oppositeDirectionsGreaterThan
      );
    }
  }
  const satisfies = (version, range, options) => {
    try {
      range = new Range(range, options);
    } catch (er) {
      return false;
    }
    return range.test(version);
  };

  const valid = (child, requested, requestor) => {
    if (typeof requested === "string") {
      try {
        // '' => '*'
        requested = getVersionInfo(requested || "*");
      } catch (err) {
        // If there are temporarily unsupported specifications,
        // directly report an error
        if (requestor) {
          requestor.errors.push(err);
        }
        return false;
      }
    }
    if (!requested) {
      if (requestor) {
        requestor.errors.push(new Error("Invalid dependency specifier"));
      }
      return false;
    }
    switch (requested.type) {
      case "range":
        if (requested.fetchSpec === "*") {
          return true;
        }
      case "version":
        // If it is a version or a range other than '*'
        return satisfies(child.version, requested.fetchSpec, true);
      case "tag":
        // If it is a tag, we just need to verify that it has a tarball
        return Boolean(child.resolved);
    }
    if (requestor) {
      requestor.errors.push(new Error("Unsupported dependency type"));
    }
    return false;
  };
  const depValid = (child, requested, accept, requestor) => {
    return (
      valid(child, requested, requestor) ||
      (typeof accept === "string" ? valid(child, accept, requestor) : false)
    );
  };

  const wf = "workspace:";
  const isWs = (spec) => spec.startsWith(wf);
  const getWsWanted = (spec) => spec.slice(wf.length);
  const isEmptyObject = (obj) => {
    for (const _k in obj) return false;
    return true;
  };
  const getDepPropByEdgeType = (edgeType, isGet) => {
    if (edgeType === "prod") return "dependencies";
    if (edgeType === "dev") return "devDependencies";
    if (edgeType === "optional") return "optionalDependencies";
    if (edgeType === "peer") return "peerDependencies";
    if (edgeType === "peerOptional") {
      return isGet ? "peerDependencies" : "peerDependenciesMeta";
    }
    throw new TypeError(`Invalid edge type "${edgeType}"`);
  };
  const jsonCache = new Map();
  const formatLockfileData = (lockfileData) => {
    if (typeof lockfileData === "string") {
      if (!jsonCache.has(lockfileData)) {
        jsonCache.set(lockfileData, JSON.parse(lockfileData));
      }
      return jsonCache.get(lockfileData);
    }
    return lockfileData;
  };
  const cache = Object.create(null);
  const parseResolutionKey = (key) => {
    if (!cache[key]) {
      const parts = key.split("/");
      let depName = "";
      let parentName = "";
      for (let i = 0; i < parts.length; i++) {
        const cur = parts[i];
        if (!parentName) {
          parentName = cur[0] === "@" ? `${cur}/${parts[++i]}` : cur;
        } else {
          depName += cur;
          if (i !== parts.length - 1) depName += "/";
        }
      }
      if (!depName) {
        depName = parentName;
        parentName = "**";
      }
      cache[key] = { depName, parentName };
    }
    return cache[key];
  };
  const formatResolutions = (resolutions) => {
    const obj = Object.create(null);
    for (const key in resolutions) {
      const { parentName, depName } = parseResolutionKey(key);
      if (!obj[parentName]) obj[parentName] = Object.create(null);
      obj[parentName][depName] = {
        raw: key,
        wanted: resolutions[key],
      };
    }
    return obj;
  };

  const getWorkspaceParent = (node, state) => {
    if (node.isWorkspace()) return node;
    state.add(node);
    for (const edge of node.usedEdges) {
      // If there is a loop, it means that there is a circular dependency,
      // and we only need to judge other nodes
      if (!state.has(edge.parentNode)) {
        const p = getWorkspaceParent(edge.parentNode, state);
        if (p) return p;
      }
    }
    return null;
  };
  function cropEmptyNodes(manager) {
    const cache = new WeakMap();
    const isEmptyNode = (node) => {
      if (!cache.has(node)) {
        if (node.usedEdges.size === 0) {
          cache.set(node, true);
        } else {
          // As long as the current node is used by the workspace node,
          // it needs to stay
          cache.set(node, !getWorkspaceParent(node, new WeakSet()));
        }
      }
      return cache.get(node);
    };
    for (const name in manager.packages) {
      const pkgs = manager.packages[name];
      for (const version in pkgs) {
        const node = pkgs[version];
        if (isEmptyNode(node)) {
          delete manager.packages[name][version];
        }
      }
      if (isEmptyObject(pkgs)) {
        delete manager.packages[name];
      }
    }
  }

  class Node {
    constructor(opts) {
      this.usedEdges = new Set();
      this.errors = [];
      this.edges = Object.create(null);
      this.pkg = opts.pkgJson;
      this.name = opts.pkgJson.name;
      this.version = opts.pkgJson.version;
      this.type = opts.type;
      this.hasBin = opts.hasBin;
      this.manager = opts.manager;
      this.resolved = opts.resolved;
      this.integrity = opts.integrity;
      this.legacyPeerDeps = opts.legacyPeerDeps;
    }
    isWorkspace() {
      return this.type === "workspace";
    }
    isOptionalEdge(edgeType) {
      return edgeType === "optional" || edgeType === "peerOptional";
    }
    hasError() {
      return this.errors.length > 0;
    }
    logErrors() {
      for (let e of this.errors) {
        if (typeof e === "string") {
          e = `(${this.name}): ${e}`;
        } else if (e instanceof Error) {
          try {
            e.message = `(${this.name}): ${e.message}`;
          } catch (e) {}
        }
        console.error(e);
      }
    }
    add(name, version = "latest", edgeType = "prod", force) {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (!force && !this.isWorkspace()) {
          throw new Error("Only add dependencies to the workspace node");
        }
        const resolution = this.manager.tryGetResolution(this.name, name);
        const accept = (this.pkg.acceptDependencies || {})[name];
        const nodeOrErr = yield this.loadSingleDepType(
          name,
          edgeType,
          version,
          resolution,
          accept
        );
        if (!nodeOrErr || nodeOrErr instanceof Node) {
          const prop = getDepPropByEdgeType(edgeType, true);
          if (!this.pkg[prop]) this.pkg[prop] = Object.create(null);
          this.pkg[prop][name] = version;
          this.manager.prune();
          return nodeOrErr;
        } else {
          throw nodeOrErr;
        }
      });
    }
    // TODO: et all the package information first,
    // and then traverse the generation node synchronously
    loadDeps() {
      const ls = [];
      const {
        dependencies,
        devDependencies,
        optionalDependencies,
        peerDependencies: pd,
      } = this.pkg;
      // install peerDependencies
      if (pd && !this.legacyPeerDeps) {
        const pm = this.pkg.peerDependenciesMeta || {};
        const peerOptional = {};
        const peerDependencies = {};
        for (const [name, dep] of Object.entries(pd)) {
          if (pm[name] && pm[name].optional) {
            peerOptional[name] = dep;
          } else {
            peerDependencies[name] = dep;
          }
        }
        ls.push(this.loadDepType(peerDependencies, "peer"));
        ls.push(this.loadDepType(peerOptional, "peerOptional"));
      }
      // Install other dependencies
      ls.push(this.loadDepType(dependencies, "prod"));
      ls.push(this.loadDepType(optionalDependencies, "optional"));
      // Only `workspaceNode` require devDependencies to be installed
      if (this.isWorkspace()) {
        ls.push(this.loadDepType(devDependencies, "dev"));
      }
      return Promise.all(ls);
    }
    loadDepType(deps, edgeType) {
      if (!deps) return;
      const ls = [];
      const ad = this.pkg.acceptDependencies || {};
      for (let [name, wanted] of Object.entries(deps)) {
        if (!name || this.edges[name]) continue;
        // Handling resolutions
        const resolution = this.manager.tryGetResolution(this.name, name);
        const accept = ad[name];
        if (typeof this.manager.opts.filter === "function") {
          if (this.manager.opts.filter(name, resolution || wanted, edgeType)) {
            this.edges[name] = this.createEdge(
              name,
              wanted,
              resolution,
              edgeType,
              accept
            );
            continue;
          }
        }
        ls.push(
          this.loadSingleDepType(name, edgeType, wanted, resolution, accept)
        );
      }
      return Promise.all(ls);
    }
    // This will force an update of the edge nodes
    loadSingleDepType(name, edgeType, wanted, resolution, accept) {
      return __awaiter$1(this, void 0, void 0, function* () {
        const finalWanted = resolution || wanted;
        const useWs = isWs(finalWanted);
        if (useWs && !this.isWorkspace()) {
          const e = new Error(`Only workspace nodes can use "${wf}"`);
          this.errors.push(e);
          return e;
        }
        // Placeholder (may be an empty object if optional)
        this.edges[name] = Object.create(null);
        const node = this.manager.tryGetReusableNode(
          name,
          finalWanted,
          this,
          accept
        );
        if (node) {
          this.edges[name] = this.createEdge(
            name,
            wanted,
            resolution,
            edgeType,
            accept,
            node
          );
          node.usedEdges.add(this.edges[name]);
          return node;
        } else if (useWs) {
          const e = new Error(
            `There are no available "${name}" nodes in workspace`
          );
          this.errors.push(e);
          return e;
        } else {
          try {
            const version = this.tryGetVersionInWorkspace(
              name,
              finalWanted,
              edgeType
            );
            const searchWanted = version === null ? finalWanted : version;
            const node = yield this.manager.createNode(name, searchWanted);
            this.edges[name] = this.createEdge(
              name,
              wanted,
              resolution,
              edgeType,
              accept,
              node
            );
            node.usedEdges.add(this.edges[name]);
            this.manager.setReusableNode(node);
            // The child node also has to load his own dependencies
            yield node.loadDeps();
            return node;
          } catch (e) {
            delete this.edges[name];
            // If optional, allow errors to occur
            if (this.isOptionalEdge(edgeType)) {
              return null;
            } else {
              this.errors.push(e);
              return e;
            }
          }
        }
      });
    }
    tryGetVersionInWorkspace(name, wanted, edgeType) {
      if (!this.isWorkspace()) return null;
      return this.manager.lockfile.tryGetEdgeVersion(
        this.name,
        name,
        wanted,
        edgeType
      );
    }
    createEdge(name, wanted, resolution, edgeType, accept, node) {
      const edge = Object.create(null);
      edge.node = node;
      edge.name = name;
      edge.type = edgeType;
      edge.accept = accept;
      edge.wanted = wanted;
      edge.parentNode = this;
      edge.resolution = resolution;
      edge.ws = isWs(wanted);
      // All are links, we are mimicking the behavior of pnpm
      edge.link = true;
      return edge;
    }
  }

  class Manager {
    constructor(opts) {
      this.opts = opts;
      this.workspace = Object.create(null);
      this.packages = Object.create(null);
      this.manifests = new Map(); // { react: { '1.0.0': Node } }
      this.resolutions = formatResolutions(opts.resolutions);
    }
    get lockfile() {
      return this.opts.lockfile;
    }
    // For the generated nodes,
    // some of them may be replaced by the current node,
    // and the same one should be reused as much as possible
    tryReplace(target) {
      if (target.isWorkspace()) return;
      const nodes = this.packages[target.name];
      if (!nodes) return;
      for (const version in nodes) {
        const node = nodes[version];
        if (node === target) continue;
        for (const edge of node.usedEdges) {
          if (
            target.version === node.version ||
            this.satisfiedBy(target, edge.wanted, null, edge.accept)
          ) {
            edge.node = target;
            target.usedEdges.add(edge);
            node.usedEdges.delete(edge);
          }
        }
      }
    }
    prune() {
      cropEmptyNodes(this);
    }
    fetchManifest(name, wanted) {
      const spec = `${name}@${wanted}`;
      if (this.manifests.has(spec)) {
        return this.manifests.get(spec);
      } else {
        const { retry, registry, customFetch } = this.opts;
        const p = gpi(name, wanted, { retry, registry, customFetch }).then(
          (mani) => {
            this.manifests.set(spec, mani);
            return mani;
          }
        );
        this.manifests.set(spec, p);
        return p;
      }
    }
    get(name) {
      return this.workspace[name] || null;
    }
    each(callback) {
      let cbRes = true;
      let i = -1;
      const pKeys = Object.keys(this.packages).sort();
      while (++i < pKeys.length) {
        const name = pKeys[i];
        // Need to be sorted, high version is preferred
        const vKeys = Object.keys(this.packages[name]).sort();
        let j = vKeys.length;
        while (~--j) {
          const version = vKeys[j];
          cbRes = callback(name, version, this.packages[name][version]);
          if (cbRes === false) break;
        }
        if (cbRes === false) break;
      }
    }
    hasError() {
      for (const k in this.workspace) {
        if (this.workspace[k].hasError()) {
          return true;
        }
      }
      let e = false;
      this.each((_n, _v, node) => {
        if (node.hasError()) {
          e = true;
          return false;
        }
      });
      return e;
    }
    logError() {
      for (const k in this.workspace) {
        this.workspace[k].logErrors();
      }
      this.each((_n, _v, node) => node.logErrors());
    }
    // accept: '' => '*'
    satisfiedBy(node, wanted, from, accept) {
      if (accept !== undefined) accept = accept || "*";
      return depValid(node, wanted, accept, from);
    }
    tryGetResolution(parentName, depName) {
      const parent = this.resolutions[parentName] || this.resolutions["**"];
      if (!parent || !parent[depName]) return null;
      return parent[depName].wanted;
    }
    tryGetReusableNode(name, wanted, from, accept) {
      if (isWs(wanted)) {
        wanted = getWsWanted(wanted);
        const node = this.workspace[name];
        if (node) {
          if (this.satisfiedBy(node, wanted, from, accept)) {
            return node;
          }
        }
      } else {
        const nodes = this.packages[name];
        if (nodes) {
          for (const version in nodes) {
            const node = nodes[version];
            if (this.satisfiedBy(node, wanted, from, accept)) {
              return node;
            }
          }
        }
      }
      return null;
    }
    setReusableNode(node) {
      if (node.isWorkspace()) {
        this.workspace[node.name] = node;
      } else {
        if (!this.packages[node.name]) {
          this.packages[node.name] = Object.create(null);
        }
        this.tryReplace(node);
        this.packages[node.name][node.version] = node;
      }
    }
    createNode(name, wanted) {
      return __awaiter$1(this, void 0, void 0, function* () {
        let pkgJson;
        let hasBin;
        let resolved;
        let integrity;
        const lockInfo = this.lockfile.tryGetNodeManifest(name, wanted);
        if (lockInfo) {
          pkgJson = lockInfo;
          resolved = lockInfo.resolved;
          integrity = lockInfo.integrity;
          hasBin = Boolean(lockInfo.hasBin);
        } else {
          pkgJson = yield this.fetchManifest(name, wanted);
          resolved = pkgJson.dist.tarball;
          integrity = pkgJson.dist.integrity;
          hasBin = Boolean(pkgJson.bin);
        }
        return new Node({
          hasBin,
          pkgJson,
          resolved,
          integrity,
          manager: this,
          type: "package",
          legacyPeerDeps: this.opts.legacyPeerDeps,
        });
      });
    }
    createWorkspaceNode(pkgJson) {
      return new Node({
        integrity: "",
        manager: this,
        type: "workspace",
        hasBin: Boolean(pkgJson.bin),
        resolved: pkgJson.resolved || "",
        legacyPeerDeps: this.opts.legacyPeerDeps,
        pkgJson: pkgJson,
      });
    }
  }

  class Lockfile {
    constructor(opts) {
      this.version = "1";
      this.managerGetter = opts.managerGetter;
      this.set(opts.json);
    }
    canUse(json) {
      if (!json || typeof json !== "object") return false;
      if (json.lockfileVersion !== this.version) return false;
      for (const p of ["importers", "packages"]) {
        if (!json[p] || typeof json[p] !== "object") return false;
      }
      return true;
    }
    recordDeps(targetNode, obj, isImport) {
      const missEdges = new Set();
      for (const key in targetNode.edges) {
        const { ws, node, type, name, wanted } = targetNode.edges[key];
        // A dependency specified by `workspace:x` that does not need to be documented in the lock file.
        // When a package is released in workspace, we assume they have handled the dependent version themselves
        // Perhaps we can provide the api to do it for them.
        if (ws) continue;
        // Record the `wanted` of the project dependency
        if (isImport) {
          let specifiers = obj.specifiers;
          if (!specifiers) {
            specifiers = obj.specifiers = Object.create(null);
          }
          specifiers[name] = wanted;
        }
        const set = (deps) => {
          if (node) {
            deps[name] = node.version;
          } else {
            // If filtered, there may be no node
            deps[name] = wanted;
            missEdges.add(name);
          }
        };
        const prop = getDepPropByEdgeType(type, false);
        if (prop === "peerDependenciesMeta") {
          // Add to `peerDependencies`
          let peerDeps = obj["peerDependencies"];
          if (!peerDeps)
            peerDeps = obj["peerDependencies"] = Object.create(null);
          if (!peerDeps[name]) set(peerDeps);
          // Record `meta`info
          let peerMeta = obj[prop];
          if (!peerMeta) peerMeta = obj[prop] = Object.create(null);
          if (!peerMeta[name]) peerMeta[name] = Object.create(null);
          peerMeta[name].optional = true;
        } else {
          if (!obj[prop]) obj[prop] = Object.create(null);
          set(obj[prop]);
        }
      }
      const ad = targetNode.pkg.acceptDependencies;
      if (ad && missEdges.size > 0) {
        for (const edgeName of missEdges) {
          const accept = ad[edgeName];
          if (accept !== undefined) {
            if (!obj["acceptDependencies"]) {
              obj["acceptDependencies"] = Object.create(null);
            }
            obj["acceptDependencies"][edgeName] = accept;
          }
        }
      }
    }
    processWorkspaceNode(targetNode, json) {
      if (targetNode.hasError()) {
        console.error('Cannot output "lockData" when an error occurs');
        targetNode.logErrors();
        return true;
      } else {
        const importerValue = (json.importers[targetNode.name] =
          Object.create(null));
        this.recordDeps(targetNode, importerValue, true);
        return false;
      }
    }
    processPackageNodes(manager, json) {
      let error = false;
      manager.each((name, version, targetNode) => {
        if (targetNode.hasError()) {
          console.error('Cannot output "lockData" when an error occurs');
          targetNode.logErrors();
          error = true;
          return false;
        }
        let pkgVersions = json.packages[name];
        if (!pkgVersions) {
          pkgVersions = json.packages[name] = Object.create(null);
        }
        let packageValue = pkgVersions[version];
        if (!packageValue) {
          packageValue = pkgVersions[version] = Object.create(null);
        }
        // Save download address and message summary
        packageValue.resolved = targetNode.resolved;
        packageValue.integrity = targetNode.integrity;
        if (targetNode.hasBin) {
          packageValue.hasBin = targetNode.hasBin;
        }
        this.recordDeps(targetNode, packageValue, false);
      });
      return error;
    }
    tryGetNodeManifest(name, version) {
      if (!this.json || !this.json.packages[name]) return null;
      const data = this.json.packages[name][version];
      if (!data) return null;
      return Object.assign({ name, version }, data);
    }
    tryGetEdgeVersion(pname, name, wanted, edgeType) {
      if (!this.json) return null;
      const lockInfo = this.json.importers[pname];
      if (!lockInfo || !lockInfo.specifiers) return null;
      const oldWanted = lockInfo.specifiers[name];
      if (oldWanted) {
        try {
          if (oldWanted === wanted || eq(oldWanted, wanted)) {
            // If the new dependencies are in pkgJson `dependencies`,
            // and the old ones are in lockfile `DevDependencies`,
            // the current algorithm is not to match
            const lockDep = lockInfo[getDepPropByEdgeType(edgeType, true)];
            if (!lockDep) return null;
            return lockDep[name] || null;
          }
        } catch (e) {
          // `semver` version comparison may report an error
          return null;
        }
      }
      return null;
    }
    set(json) {
      json = formatLockfileData(json);
      if (this.canUse(json)) {
        this.json = json;
        return true;
      }
      return false;
    }
    output() {
      const manager = this.managerGetter();
      const json = Object.create(null);
      json.lockfileVersion = this.version;
      json.importers = Object.create(null);
      json.packages = Object.create(null);
      // If there is an error, the lockfile cannot be generated
      if (this.processPackageNodes(manager, json)) return null;
      for (const [_n, node] of Object.entries(manager.workspace)) {
        if (this.processWorkspaceNode(node, json)) return null;
      }
      return json;
    }
    // Get the packages that need to be added or deleted
    diff(newJson, type = "all", oldJson = this.json) {
      const mark = Object.create(null);
      // prettier-ignore
      const oldPackages = oldJson && this.canUse(oldJson)
                ? oldJson.packages
                : Object.create(null);
      const traverse = (lp, rp) => {
        const set = Object.create(null);
        for (const name in lp) {
          if (lp[name]) {
            for (const version in lp[name]) {
              const spec = `${name}@${version}`;
              if (mark[spec]) continue;
              mark[spec] = true;
              if (!rp[name] || !rp[name][version]) {
                if (!set[name]) set[name] = Object.create(null);
                set[name][version] = lp[name][version];
              }
            }
          }
        }
        return set;
      };
      const add =
        type === "all" || type === "add"
          ? traverse(newJson.packages, oldPackages)
          : {};
      const remove =
        type === "all" || type === "remove"
          ? traverse(oldPackages, newJson.packages)
          : {};
      return { add, remove };
    }
  }

  function install(opts = {}) {
    return __awaiter$1(this, void 0, void 0, function* () {
      const lockfile = new Lockfile({
        json: opts.lockData,
        managerGetter: () => manager,
      });
      const manager = new Manager({
        lockfile,
        retry: opts.retry,
        filter: opts.filter,
        registry: opts.registry,
        customFetch: opts.customFetch,
        resolutions: opts.resolutions || {},
        legacyPeerDeps: Boolean(opts.legacyPeerDeps),
      });
      if (opts.workspace) {
        for (const [name, pkg] of Object.entries(opts.workspace)) {
          pkg.name = name;
          if (!pkg.version) pkg.version = "*";
          const node = manager.createWorkspaceNode(pkg);
          manager.setReusableNode(node);
        }
        yield Promise.all(
          Object.entries(manager.workspace).map(([k, n]) => n.loadDeps())
        );
      }
      manager.prune();
      return manager;
    });
  }

  exports.install = install;

  Object.defineProperty(exports, "__esModule", { value: true });
});
