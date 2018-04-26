export {RuntimeError} from "./errors";
import {default as Library, Mutable} from "./library";
export {default as Notebook} from "./notebook";
import {default as Runtime} from "./runtime";
export {Library, Runtime};

export function load(notebookModule, nodes = {}) {
  const {modules} = notebookModule;
  const library = new Library();
  const runtime = new Runtime(library);
  const moduleMap = new Map();
  const {Generators} = library;

  modules.forEach(m =>  moduleMap.set(m.id, runtime.module()));

  modules.forEach(m => {
    const module = moduleMap.get(m.id);
    m.variables.forEach(v => {
      const node = m.id === notebookModule.main ? nodes[v.name] : null;
      const variable = module.variable(node);
      if (v.flag) {
        v.value = flag_value(v.flag, v.value);
      }
      if (v.from) {
        variable.import(v.name, v.remote, moduleMap.get(v.from));
      } else {
        variable.define(v.name, v.inputs, v.value);
      }
    });
  });

  function flag_value(flag, value) {
    switch (flag) {
      case "view-value": return Generators.input;
      case "mutable": return Mutable.value(value);
      case "mutable-value": return _ => _.generator;
    }
  }
}
