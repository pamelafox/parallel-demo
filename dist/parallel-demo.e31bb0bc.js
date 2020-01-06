// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"node_modules/@babel/runtime/regenerator/index.js":[function(require,module,exports) {
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":"node_modules/regenerator-runtime/runtime.js"}],"node_modules/@babel/runtime/helpers/asyncToGenerator.js":[function(require,module,exports) {
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
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],"../../../../usr/local/lib/node_modules/parcel-bundler/node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"node_modules/workerpool/dist/workerpool.min.js":[function(require,module,exports) {
var define;
var process = require("process");
var __dirname = "/Users/pamelafox/Documents/parallel-demo/node_modules/workerpool/dist";
/**
 * workerpool.js
 * https://github.com/josdejong/workerpool
 *
 * Offload tasks to a pool of workers on node.js and in the browser.
 *
 * @version 5.0.4
 * @date    2019-12-31
 *
 * @license
 * Copyright (C) 2014-2019 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define("workerpool",[],r):"object"==typeof exports?exports.workerpool=r():e.workerpool=r()}("undefined"!=typeof self?self:this,function(){return d=[function(e,r,t){function o(e){return void 0!==e&&null!=e.versions&&null!=e.versions.node}var n=t(2);e.exports.isNode=o,e.exports.platform="undefined"!=typeof process&&o(process)?"node":"browser";var i=function(e){try{return n(e)}catch(e){return null}}("worker_threads");e.exports.isMainThread="node"===e.exports.platform?(!i||i.isMainThread)&&!process.connected:"undefined"!=typeof Window,e.exports.cpus="browser"===e.exports.platform?self.navigator.hardwareConcurrency:n("os").cpus().length},function(e,r,t){"use strict";function a(e,t){var o=this;if(!(this instanceof a))throw new SyntaxError("Constructor must be called with the new operator");if("function"!=typeof e)throw new SyntaxError("Function parameter handler(resolve, reject) missing");var n=[],i=[];this.resolved=!1,this.rejected=!1,this.pending=!0;var s=function(e,r){n.push(e),i.push(r)};this.then=function(n,i){return new a(function(e,r){var t=n?c(n,e,r):e,o=i?c(i,e,r):r;s(t,o)},o)};var r=function(t){return o.resolved=!0,o.rejected=!1,o.pending=!1,n.forEach(function(e){e(t)}),s=function(e,r){e(t)},r=u=function(){},o},u=function(t){return o.resolved=!1,o.rejected=!0,o.pending=!1,i.forEach(function(e){e(t)}),s=function(e,r){r(t)},r=u=function(){},o};this.cancel=function(){return t?t.cancel():u(new f),o},this.timeout=function(e){if(t)t.timeout(e);else{var r=setTimeout(function(){u(new p("Promise timed out after "+e+" ms"))},e);o.always(function(){clearTimeout(r)})}return o},e(function(e){r(e)},function(e){u(e)})}function c(t,o,n){return function(e){try{var r=t(e);r&&"function"==typeof r.then&&"function"==typeof r.catch?r.then(o,n):o(r)}catch(e){n(e)}}}function f(e){this.message=e||"promise cancelled",this.stack=(new Error).stack}function p(e){this.message=e||"timeout exceeded",this.stack=(new Error).stack}a.prototype.catch=function(e){return this.then(null,e)},a.prototype.always=function(e){return this.then(e,e)},a.all=function(e){return new a(function(t,o){var n=e.length,i=[];n?e.forEach(function(e,r){e.then(function(e){i[r]=e,0==--n&&t(i)},function(e){n=0,o(e)})}):t(i)})},a.defer=function(){var t={};return t.promise=new a(function(e,r){t.resolve=e,t.reject=r}),t},(f.prototype=new Error).constructor=Error,f.prototype.name="CancellationError",a.CancellationError=f,(p.prototype=new Error).constructor=Error,p.prototype.name="TimeoutError",a.TimeoutError=p,e.exports=a},function(module,exports){var requireFoolWebpack=eval("typeof require !== 'undefined' ? require : function (module) { throw new Error('Module \" + module + \" not found.') }");module.exports=requireFoolWebpack},function(e,r,t){var o=t(0);r.pool=function(e,r){return new(t(4))(e,r)},r.worker=function(e){var r=t(8);r.add(e)},r.Promise=t(1),r.platform=o.platform,r.isMainThread=o.isMainThread,r.cpus=o.cpus},function(e,r,t){var s=t(1),o=t(5),n=t(0),i=new(t(7));function u(e,r){"string"==typeof e?this.script=e||null:(this.script=null,r=e),this.workers=[],this.tasks=[],(r=r||{}).nodeWorker&&console.warn('WARNING: Option "nodeWorker" is deprecated since workerpool@5.0.0. Please use "workerType" instead.'),this.forkArgs=r.forkArgs||[],this.forkOpts=r.forkOpts||{},this.debugPortStart=r.debugPortStart||43210,this.nodeWorker=r.nodeWorker,this.workerType=r.workerType||r.nodeWorker||"auto",this.maxQueueSize=r.maxQueueSize||1/0,r&&"maxWorkers"in r?(function(e){if(!a(e)||!c(e)||e<1)throw new TypeError("Option maxWorkers must be an integer number >= 1")}(r.maxWorkers),this.maxWorkers=r.maxWorkers):this.maxWorkers=Math.max((n.cpus||4)-1,1),r&&"minWorkers"in r&&("max"===r.minWorkers?this.minWorkers=this.maxWorkers:(function(e){if(!a(e)||!c(e)||e<0)throw new TypeError("Option minWorkers must be an integer number >= 0")}(r.minWorkers),this.minWorkers=r.minWorkers,this.maxWorkers=Math.max(this.minWorkers,this.maxWorkers)),this._ensureMinWorkers()),this._boundNext=this._next.bind(this),"thread"===this.workerType&&o.ensureWorkerThreads()}function a(e){return"number"==typeof e}function c(e){return Math.round(e)==e}u.prototype.exec=function(e,r){if(r&&!Array.isArray(r))throw new TypeError('Array expected as argument "params"');if("string"==typeof e){var t=s.defer();if(this.tasks.length>=this.maxQueueSize)throw new Error("Max queue size of "+this.maxQueueSize+" reached");var o=this.tasks,n={method:e,params:r,resolver:t,timeout:null};o.push(n);var i=t.promise.timeout;return t.promise.timeout=function(e){return-1!==o.indexOf(n)?(n.timeout=e,t.promise):i.call(t.promise,e)},this._next(),t.promise}if("function"==typeof e)return this.exec("run",[String(e),r]);throw new TypeError('Function or string expected as argument "method"')},u.prototype.proxy=function(){if(0<arguments.length)throw new Error("No arguments expected");var t=this;return this.exec("methods").then(function(e){var r={};return e.forEach(function(e){r[e]=function(){return t.exec(e,Array.prototype.slice.call(arguments))}}),r})},u.prototype._next=function(){if(0<this.tasks.length){var e=this._getWorker();if(e){var r=this,t=this.tasks.shift();if(t.resolver.promise.pending){var o=e.exec(t.method,t.params,t.resolver).then(r._boundNext).catch(function(){e.terminated&&(r._removeWorker(e),r._ensureMinWorkers()),r._next()});"number"==typeof t.timeout&&o.timeout(t.timeout)}else r._next()}}},u.prototype._getWorker=function(){for(var e=this.workers,r=0;r<e.length;r++){var t=e[r];if(!1===t.busy())return t}return e.length<this.maxWorkers?(t=this._createWorkerHandler(),e.push(t),t):null},u.prototype._removeWorker=function(e){i.releasePort(e.debugPort),e.terminate(),this._removeWorkerFromList(e)},u.prototype._removeWorkerFromList=function(e){var r=this.workers.indexOf(e);-1!==r&&this.workers.splice(r,1)},u.prototype.terminate=function(t,o){this.tasks.forEach(function(e){e.resolver.reject(new Error("Pool terminated"))}),this.tasks.length=0;var n=function(e){this._removeWorkerFromList(e)}.bind(this),i=[];return this.workers.slice().forEach(function(e){var r=e.terminateAndNotify(t,o).then(n);i.push(r)}),s.all(i)},u.prototype.clear=function(e){console.warn("Pool.clear() is deprecated. Use Pool.terminate() instead."),this.terminate(e)},u.prototype.stats=function(){var e=this.workers.length,r=this.workers.filter(function(e){return e.busy()}).length;return{totalWorkers:e,busyWorkers:r,idleWorkers:e-r,pendingTasks:this.tasks.length,activeTasks:r}},u.prototype._ensureMinWorkers=function(){if(this.minWorkers)for(var e=this.workers.length;e<this.minWorkers;e++)this.workers.push(this._createWorkerHandler())},u.prototype._createWorkerHandler=function(){return new o(this.script,{forkArgs:this.forkArgs,forkOpts:this.forkOpts,debugPort:i.nextAvailableStartingAt(this.debugPortStart),workerType:this.workerType})},e.exports=u},function(e,r,s){"use strict";var u=s(1),a=s(0),c=s(2);function f(){var e=d();if(!e)throw new Error("WorkerPool: workerType = 'thread' is not supported, Node >= 11.7.0 required");return e}function p(){if("function"!=typeof Worker&&("object"!=typeof Worker||"function"!=typeof Worker.prototype.constructor))throw new Error("WorkerPool: Web Workers not supported")}function d(){try{return c("worker_threads")}catch(e){if("object"==typeof e&&null!==e&&"MODULE_NOT_FOUND"===e.code)return null;throw e}}function h(e,r){var t=new r(e);return t.isBrowserWorker=!0,t.on=function(e,r){this.addEventListener(e,function(e){r(e.data)})},t.send=function(e){this.postMessage(e)},t}function l(e,r){var t=new r.Worker(e,{stdout:!1,stderr:!1});return t.isWorkerThread=!0,t.send=function(e){this.postMessage(e)},t.kill=function(){this.terminate()},t.disconnect=function(){this.terminate()},t}function k(e,r,t){var o=t.fork(e,r.forkArgs,r.forkOpts);return o.isChildProcess=!0,o}function m(e){e=e||{};var r=process.execArgv.join(" "),t=-1!==r.indexOf("--inspect"),o=-1!==r.indexOf("--debug-brk"),n=[];return t&&(n.push("--inspect="+e.debugPort),o&&n.push("--debug-brk")),process.execArgv.forEach(function(e){-1<e.indexOf("--max-old-space-size")&&n.push(e)}),Object.assign({},e,{forkArgs:e.forkArgs,forkOpts:Object.assign({},e.forkOpts,{execArgv:(e.forkOpts&&e.forkOpts.execArgv||[]).concat(n)})})}function t(e,r){var o=this,t=r||{};function n(e){for(var r in o.terminated=!0,o.terminating&&o.terminationHandler&&o.terminationHandler(o),o.terminating=!1,o.processing)void 0!==o.processing[r]&&o.processing[r].resolver.reject(e);o.processing=Object.create(null)}this.script=e||function(){if("browser"!==a.platform)return __dirname+"/worker.js";if("undefined"==typeof Blob)throw new Error("Blob not supported by the browser");if(!window.URL||"function"!=typeof window.URL.createObjectURL)throw new Error("URL.createObjectURL not supported by the browser");var e=new Blob([s(6)],{type:"text/javascript"});return window.URL.createObjectURL(e)}(),this.worker=function(e,r){if("web"===r.workerType)return p(),h(e,Worker);if("thread"===r.workerType)return l(e,t=f());if("process"!==r.workerType&&r.workerType){if("browser"===a.platform)return p(),h(e,Worker);var t=d();return t?l(e,t):k(e,m(r),c("child_process"))}return k(e,m(r),c("child_process"))}(this.script,t),this.debugPort=t.debugPort,e||(this.worker.ready=!0),this.requestQueue=[],this.worker.on("message",function(e){if("string"==typeof e&&"ready"===e)o.worker.ready=!0,o.requestQueue.forEach(o.worker.send.bind(o.worker)),o.requestQueue=[];else{var r=e.id,t=o.processing[r];void 0!==t&&(delete o.processing[r],!0===o.terminating&&o.terminate(),e.error?t.resolver.reject(function(e){for(var r=new Error(""),t=Object.keys(e),o=0;o<t.length;o++)r[t[o]]=e[t[o]];return r}(e.error)):t.resolver.resolve(e.result))}});var i=this.worker;this.worker.on("error",n),this.worker.on("exit",function(e,r){var t="Workerpool Worker terminated Unexpectedly\n";t+="    exitCode: `"+e+"`\n",t+="    signalCode: `"+r+"`\n",t+="    workerpool.script: `"+o.script+"`\n",t+="    spawnArgs: `"+i.spawnargs+"`\n",t+="    spawnfile: `"+i.spawnfile+"`\n",t+="    stdout: `"+i.stdout+"`\n",t+="    stderr: `"+i.stderr+"`\n",n(new Error(t))}),this.processing=Object.create(null),this.terminating=!1,this.terminated=!1,this.terminationHandler=null,this.lastId=0}t.prototype.methods=function(){return this.exec("methods")},t.prototype.exec=function(e,r,t){t=t||u.defer();var o=++this.lastId;this.processing[o]={id:o,resolver:t};var n={id:o,method:e,params:r};this.terminated?t.reject(new Error("Worker is terminated")):this.worker.ready?this.worker.send(n):this.requestQueue.push(n);var i=this;return t.promise.catch(function(e){if(!(e instanceof u.CancellationError||e instanceof u.TimeoutError))throw e;delete i.processing[o],i.terminate(!0)}),t.promise},t.prototype.busy=function(){return 0<Object.keys(this.processing).length},t.prototype.terminate=function(e,r){if(e){for(var t in this.processing)void 0!==this.processing[t]&&this.processing[t].resolver.reject(new Error("Worker terminated"));this.processing=Object.create(null)}if("function"==typeof r&&(this.terminationHandler=r),this.busy())this.terminating=!0;else{if(this.worker){if("function"==typeof this.worker.kill)this.worker.kill();else{if("function"!=typeof this.worker.terminate)throw new Error("Failed to terminate worker");this.worker.terminate()}this.worker=null}this.terminating=!1,this.terminated=!0,this.terminationHandler&&this.terminationHandler(this)}},t.prototype.terminateAndNotify=function(e,r){var t=u.defer();return r&&(t.promise.timeout=r),this.terminate(e,function(e){t.resolve(e)}),t.promise},e.exports=t,e.exports._tryRequireWorkerThreads=d,e.exports._setupProcessWorker=k,e.exports._setupBrowserWorker=h,e.exports._setupWorkerThreadWorker=l,e.exports.ensureWorkerThreads=f},function(e,r){e.exports='!function(o){var n={};function t(e){if(n[e])return n[e].exports;var r=n[e]={i:e,l:!1,exports:{}};return o[e].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=o,t.c=n,t.d=function(e,r,o){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(r,e){if(1&e&&(r=t(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var n in r)t.d(o,n,function(e){return r[e]}.bind(null,n));return o},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=0)}([function(module,exports,__webpack_require__){var requireFoolWebpack=eval("typeof require !== \'undefined\' ? require : function (module) { throw new Error(\'Module \\" + module + \\" not found.\') }"),worker={};if("undefined"!=typeof self&&"function"==typeof postMessage&&"function"==typeof addEventListener)worker.on=function(e,r){addEventListener(e,function(e){r(e.data)})},worker.send=function(e){postMessage(e)};else{if("undefined"==typeof process)throw new Error("Script must be executed as a worker");var WorkerThreads;try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(e){if("object"!=typeof e||null===e||"MODULE_NOT_FOUND"!=e.code)throw e}if(WorkerThreads&&null!==WorkerThreads.parentPort){var parentPort=WorkerThreads.parentPort;worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)}else worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on("disconnect",function(){process.exit(1)})}function convertError(o){return Object.getOwnPropertyNames(o).reduce(function(e,r){return Object.defineProperty(e,r,{value:o[r],enumerable:!0})},{})}function isPromise(e){return e&&"function"==typeof e.then&&"function"==typeof e.catch}worker.methods={},worker.methods.run=function run(fn,args){var f=eval("("+fn+")");return f.apply(f,args)},worker.methods.methods=function(){return Object.keys(worker.methods)},worker.on("message",function(r){try{var e=worker.methods[r.method];if(!e)throw new Error(\'Unknown method "\'+r.method+\'"\');var o=e.apply(e,r.params);isPromise(o)?o.then(function(e){worker.send({id:r.id,result:e,error:null})}).catch(function(e){worker.send({id:r.id,result:null,error:convertError(e)})}):worker.send({id:r.id,result:o,error:null})}catch(e){worker.send({id:r.id,result:null,error:convertError(e)})}}),worker.register=function(e){if(e)for(var r in e)e.hasOwnProperty(r)&&(worker.methods[r]=e[r]);worker.send("ready")},exports.add=worker.register}]);'},function(e,r,t){"use strict";function o(){this.ports=Object.create(null),this.length=0}(e.exports=o).prototype.nextAvailableStartingAt=function(e){for(;!0===this.ports[e];)e++;if(65535<=e)throw new Error("WorkerPool debug port limit reached: "+e+">= 65535");return this.ports[e]=!0,this.length++,e},o.prototype.releasePort=function(e){delete this.ports[e],this.length--}},function(module,exports,__webpack_require__){var requireFoolWebpack=eval("typeof require !== 'undefined' ? require : function (module) { throw new Error('Module \" + module + \" not found.') }"),worker={};if("undefined"!=typeof self&&"function"==typeof postMessage&&"function"==typeof addEventListener)worker.on=function(e,r){addEventListener(e,function(e){r(e.data)})},worker.send=function(e){postMessage(e)};else{if("undefined"==typeof process)throw new Error("Script must be executed as a worker");var WorkerThreads;try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(e){if("object"!=typeof e||null===e||"MODULE_NOT_FOUND"!=e.code)throw e}if(WorkerThreads&&null!==WorkerThreads.parentPort){var parentPort=WorkerThreads.parentPort;worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)}else worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on("disconnect",function(){process.exit(1)})}function convertError(t){return Object.getOwnPropertyNames(t).reduce(function(e,r){return Object.defineProperty(e,r,{value:t[r],enumerable:!0})},{})}function isPromise(e){return e&&"function"==typeof e.then&&"function"==typeof e.catch}worker.methods={},worker.methods.run=function run(fn,args){var f=eval("("+fn+")");return f.apply(f,args)},worker.methods.methods=function(){return Object.keys(worker.methods)},worker.on("message",function(r){try{var e=worker.methods[r.method];if(!e)throw new Error('Unknown method "'+r.method+'"');var t=e.apply(e,r.params);isPromise(t)?t.then(function(e){worker.send({id:r.id,result:e,error:null})}).catch(function(e){worker.send({id:r.id,result:null,error:convertError(e)})}):worker.send({id:r.id,result:t,error:null})}catch(e){worker.send({id:r.id,result:null,error:convertError(e)})}}),worker.register=function(e){if(e)for(var r in e)e.hasOwnProperty(r)&&(worker.methods[r]=e[r]);worker.send("ready")},exports.add=worker.register}],e={},g.m=d,g.c=e,g.d=function(e,r,t){g.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},g.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},g.t=function(r,e){if(1&e&&(r=g(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(g.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var o in r)g.d(t,o,function(e){return r[e]}.bind(null,o));return t},g.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return g.d(r,"a",r),r},g.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},g.p="",g(g.s=3);function g(r){if(e[r])return e[r].exports;var t=e[r]={i:r,l:!1,exports:{}};return d[r].call(t.exports,t,t.exports,g),t.l=!0,t.exports}var d,e});

},{"process":"../../../../usr/local/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var workerpool = require('workerpool');

var recordedTimes = [];

function recordTimeStart(activityName) {
  recordedTimes[activityName] = {
    "start": new Date().getTime()
  };
  var tableRow = document.createElement("tr");
  var operationTd = document.createElement("td");
  var durationTd = document.createElement("td");
  operationTd.innerText = activityName;
  durationTd.innerText = "(in progress)";
  tableRow.appendChild(operationTd);
  tableRow.appendChild(durationTd);
  document.getElementById("times").appendChild(tableRow);
}

;

function recordTimeEnd(activityName) {
  recordedTimes[activityName]["end"] = new Date().getTime();
  recordedTimes[activityName]["duration"] = recordedTimes[activityName]["end"] - recordedTimes[activityName]["start"];
  var timesTbody = document.getElementById("times");
  var tableRow = document.createElement("tr");
  var operationTd = document.createElement("td");
  var durationTd = document.createElement("td");
  operationTd.innerText = activityName;
  durationTd.innerText = recordedTimes[activityName]["duration"];
  tableRow.appendChild(operationTd);
  tableRow.appendChild(durationTd);
  timesTbody.removeChild(timesTbody.lastChild);
  timesTbody.appendChild(tableRow);
}

;

function loadImage(_x, _x2) {
  return _loadImage.apply(this, arguments);
}

function _loadImage() {
  _loadImage = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(imageName, imagesDiv) {
    var imageNode, onImageLoad;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            onImageLoad = function _ref() {
              return new Promise(function (resolve) {
                imageNode.addEventListener("load", resolve, {
                  once: true
                });
              });
            };

            imageNode = document.createElement("img");
            imageNode.src = "./images/" + imageName;
            imagesDiv.appendChild(imageNode);
            _context.next = 6;
            return onImageLoad();

          case 6:
            return _context.abrupt("return", imageNode);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _loadImage.apply(this, arguments);
}

function processImage(imageName, imageNode, pool) {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", imageNode.naturalWidth);
  canvas.setAttribute("height", imageNode.naturalHeight);
  var canvasContext = canvas.getContext('2d');
  canvasContext.drawImage(imageNode, 0, 0);
  var imageData = canvasContext.getImageData(0, 0, imageNode.naturalWidth, imageNode.naturalHeight);
  var dataObj = {
    name: imageName,
    pixels: imageData.data.buffer,
    width: imageNode.naturalWidth,
    height: imageNode.naturalHeight
  };
  console.log("Processing image");
  var worker = pool.getW;
  pool.queue(function (handleImage) {
    handleImage(dataObj).then(function (foundCat) {
      console.log("Found cat?", foundCat);
    });
  });
}

var imageNames = ["butterfly.png", "crocodiles.png", "cat.png", "birds_rainbow-lorakeets.png", "boxer-getting-tan.png", "boxer-laying-down.png"];
var imageNodes = [];
var imagesDiv = document.getElementById("images");
var pool = new WorkerPool("worker.js");

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    var i, _imageNode;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < imageNames.length)) {
              _context2.next = 9;
              break;
            }

            _context2.next = 4;
            return loadImage(imageNames[i], imagesDiv);

          case 4:
            _imageNode = _context2.sent;
            processImage(imageNames[i], _imageNode, pool);

          case 6:
            i++;
            _context2.next = 1;
            break;

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _main.apply(this, arguments);
}

main().catch(console.error); // https://www.kevinhoyt.com/2018/10/23/image-processing-in-a-web-worker/
// https://www.kevinhoyt.com/2018/10/31/transferable-imagedata/
// https://stackoverflow.com/questions/54359728/tensorflow-js-in-webworkers
// https://github.com/tensorflow/tfjs/issues/102
// https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency
},{"@babel/runtime/regenerator":"node_modules/@babel/runtime/regenerator/index.js","@babel/runtime/helpers/asyncToGenerator":"node_modules/@babel/runtime/helpers/asyncToGenerator.js","workerpool":"node_modules/workerpool/dist/workerpool.min.js"}],"../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52106" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/parallel-demo.e31bb0bc.js.map