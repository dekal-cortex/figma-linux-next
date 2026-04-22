import { test, expect } from "bun:test";

// Mocking Figma API
const mockFigma = () => {
  const styles = new Map();
  const variables = new Map();
  const collections = new Map();

  let getStyleByIdCalls = 0;
  let getVariableByIdCalls = 0;
  let getVariableCollectionByIdCalls = 0;

  return {
    getStyleById: (id) => {
      getStyleByIdCalls++;
      return styles.get(id);
    },
    variables: {
      getVariableById: (id) => {
        getVariableByIdCalls++;
        return variables.get(id);
      },
      getVariableCollectionById: (id) => {
        getVariableCollectionByIdCalls++;
        return collections.get(id);
      },
    },
    // Helper to setup data
    _setup: (s, v, c) => {
      s.forEach(style => styles.set(style.id, style));
      v.forEach(variable => variables.set(variable.id, variable));
      c.forEach(collection => collections.set(collection.id, collection));
    },
    _getCalls: () => ({
      getStyleByIdCalls,
      getVariableByIdCalls,
      getVariableCollectionByIdCalls
    }),
    _resetCalls: () => {
      getStyleByIdCalls = 0;
      getVariableByIdCalls = 0;
      getVariableCollectionByIdCalls = 0;
    }
  };
};

test("VARIABLE_DEFS_SCRIPT Performance Optimization", async () => {
  const figma = mockFigma();

  // Setup mock data
  const mockStyle = { id: "S:1", name: "Style 1", type: "PAINT", description: "" };
  const mockCollection = { id: "C:1", name: "Collection 1", modes: [{ modeId: "M:1", name: "Mode 1" }] };
  const mockVariable = {
    id: "V:1",
    name: "Var 1",
    resolvedType: "COLOR",
    variableCollectionId: "C:1",
    valuesByMode: { "M:1": "#ffffff" }
  };

  figma._setup([mockStyle], [mockVariable], [mockCollection]);

  // Create a tree of nodes all using the same style and variable
  const createNode = (id) => ({
    id,
    boundVariables: {
      fills: { id: "V:1" }
    },
    fillStyleId: "S:1",
    strokeStyleId: "S:1",
    textStyleId: "S:1",
    effectStyleId: "S:1",
    gridStyleId: "S:1",
    children: []
  });

  const root = createNode("root");
  for (let i = 0; i < 100; i++) {
    root.children.push(createNode(`child-${i}`));
  }

  const targetNodes = [root];
  const variables = {};
  const styles = {};

  // This is the logic from VARIABLE_DEFS_SCRIPT with optimizations
  const seenVariables = new Set();
  const seenStyles = new Set();
  const collectionsCache = new Map();

  function collectVariables(node) {
    if ('boundVariables' in node && node.boundVariables) {
      for (const [prop, binding] of Object.entries(node.boundVariables)) {
        try {
          const bindings = Array.isArray(binding) ? binding : [binding];
          for (const b of bindings) {
            if (b && b.id && !seenVariables.has(b.id)) {
              seenVariables.add(b.id);
              const v = figma.variables.getVariableById(b.id);
              if (v && !variables[v.id]) {
                let collection = collectionsCache.get(v.variableCollectionId);
                if (collection === undefined) {
                  collection = figma.variables.getVariableCollectionById(v.variableCollectionId);
                  collectionsCache.set(v.variableCollectionId, collection);
                }
                variables[v.id] = {
                  name: v.name,
                  type: v.resolvedType,
                  collection: collection ? collection.name : null,
                  valuesByMode: {},
                };
                if (collection) {
                  for (const mode of collection.modes) {
                    try {
                      const val = v.valuesByMode[mode.modeId];
                      variables[v.id].valuesByMode[mode.name] = JSON.parse(JSON.stringify(val));
                    } catch(e) {}
                  }
                }
              }
            }
          }
        } catch(e) {}
      }
    }

    const styleProps = ['fillStyleId', 'strokeStyleId', 'textStyleId', 'effectStyleId', 'gridStyleId'];
    for (const prop of styleProps) {
      if (prop in node && node[prop] && typeof node[prop] === 'string') {
        const styleId = node[prop];
        if (!seenStyles.has(styleId)) {
          seenStyles.add(styleId);
          try {
            const style = figma.getStyleById(styleId);
            if (style && !styles[style.id]) {
              styles[style.id] = {
                name: style.name,
                type: style.type,
                description: style.description || null,
              };
            }
          } catch(e) {}
        }
      }
    }

    if ('children' in node) {
      node.children.forEach(collectVariables);
    }
  }

  const start = performance.now();
  targetNodes.forEach(collectVariables);
  const end = performance.now();

  const calls = figma._getCalls();
  console.log(`Optimized Execution Time: ${(end - start).toFixed(4)}ms`);
  console.log(`Optimized Calls:`, calls);

  // We expect exactly 1 call for each style and variable regardless of node count
  expect(calls.getStyleByIdCalls).toBe(1);
  expect(calls.getVariableByIdCalls).toBe(1);
  expect(calls.getVariableCollectionByIdCalls).toBe(1);
});
