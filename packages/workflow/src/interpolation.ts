import jsonpath from "jsonpath";
import { TriggerEvent } from "./types";

/**
 * resolveInputs takes an object of action inputs, and fully interpolates all
 * refs within the inputs using the given state and event.
 * 
 * @param inputs an object of actio inputs
 * @param state the current engine state
 * @param event the event triggering the workflow
 * @returns an object with the resolved inputs fully interpolated
 */
export const resolveInputs = (
  inputs: Record<string, any>,
  state: Record<string, any>,
  event: TriggerEvent,
): Record<string, any> => {
  const outputs: Record<string, any> = {};
  for (let key in (inputs ?? {})) {
    outputs[key] = interpolate(inputs[key], state, event);
  }
  return outputs
}


/**
 * refs returns a list of all refs found within the input, as an object
 * containing the path and the original ref.
 * 
 * @param input any action input, eg. a string, object, or number,
 * @returns a list of all refs found.
 */
export function refs(input: any): Array<{ path: string, ref: string }> {
  if (typeof(input) !== "string") {
    return []
  }
  // Ensure that the ref matches a proper regex.
  let result = []
  for (const match of  input.matchAll(/\!ref\((\$.[\w\.]+)\)/g)) {
    if (match[1]) {
      // Push the JSON path and the original ref, to make substring
      // replacement easier.
      result.push({ path: match[1], ref: match[0] })
    }
  }
  return result
}

/**
 * interpolate takes a single input and interpolates all refs within the input using
 * the given state and event.
 * 
 * This handles non-ref values, single refs which return non-string values, string
 * interpolation, and object interpolation with a full depth-first traversal to interpoalte
 * all values within an object.
 * 
 * @param value any action input, eg. a string, object, or number,
 * @param state the current engine state
 * @param event the event triggering the workflow
 * @returns the input with all refs interpolated
 */
export function interpolate(value: any, state: Record<string, any>, event: TriggerEvent) {
  let result = value;

  // TODO: Handle $.result

  if (isRef(result)) {
    // Handle pure references immediately.  Remove "!ref(" and ")"
    result = result.replace("!ref(", "")
    result = result.substring(0, result.length-1)
    return interpolatedRefValue(result, state, event);
  }

  // If this is an object, walk the object and interpolate any refs within.
  if (typeof(result) === "object" && result !== null) {
    return interpolateObject(result, state, event);
  }


  // This is a string which contains refs as values within content,
  // eg. "Hello !ref($.event.data.name)".
  const foundRefs = refs(result)
  while (foundRefs.length > 0) {
    // Replace the ref with the interpolated value.
    let { path: jsonPath, ref: substr } = foundRefs.shift() ?? { path: "", ref: "" };
    result = result.replace(substr, interpolatedRefValue(jsonPath, state, event))
  }

  return result
}

function interpolateObject(value: Object, state: Record<string, any>, event: TriggerEvent) {
  let result = value;

  const stack: Array<{ obj: Record<string, any>, key: string | null }> = [{ obj: result, key: null }];

  // This is a reimplementaiton of interpolace() to prevent recursion and stack overflows. A
  // basic implementation is simply:
  //   if (typeof(result) === "object" && result !== null) {
  //     for (let key in result) {
  //       result[key] = interpolate(result[key], state, event);
  //     }
  //     return result
  //   }
  while (stack.length > 0) {
    const { obj, key } = stack.pop()!;

    if (key === null) {
      // Process all keys of the current object
      for (let k in obj) {
        stack.push({ obj, key: k });
      }
      continue
    }

    // Process the value of the current key.
    let value = obj[key];

    if (isRef(value)) {
      // Handle pure references
      value = value.replace("!ref(", "").slice(0, -1);
      obj[key] = interpolatedRefValue(value, state, event);
    } else if (typeof value === "string") {
      // Handle string with embedded refs
      let foundRefs = refs(value);
      while (foundRefs.length > 0) {
        let { path, ref } = foundRefs.shift()!;
        value = value.replace(ref, interpolatedRefValue(path, state, event));
      }
      obj[key] = value;
    } else if (typeof value === "object" && value !== null) {
      // Push object for further processing
      stack.push({ obj: value, key: null });
    }
  }

  return result;
}


function interpolatedRefValue(path: string, state: Record<string, any>, event: TriggerEvent) {
  const value = jsonpath.query({ state, event }, path)
  if (!Array.isArray(value)) {
    return value
  }
  if (value.length === 0) {
    // Not found in state, so this is undefined.
    return undefined;
  }
  // JSON-path always returns an array containing the embedded results.  The first
  // el is the result.
  if (value.length === 1) {
    return value[0]
  }
  return value;
}


// isRef returns true if the input is a reference, like !ref($state.foo).  We handle
// pure refs differently than strings which contain refs as part of the value.
function isRef(input: string) {
  if (typeof(input) !== "string" || input.indexOf("!ref($.") !== 0) {
    return false
  }
  return input.substring(input.length-1) === ")"
}
