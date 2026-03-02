export type WithFieldMask<T> = {
  [K in keyof T]?: WithFieldMask<T[K]> | undefined;
};

export function applyFieldMask<T>(
  sourceObject: T,
  fieldMask: readonly string[],
): WithFieldMask<T> {
  if (!_isObject(sourceObject)) {
    return sourceObject;
  }
  const result = {};

  for (let i = 0; i < fieldMask.length; i++) {
    const path = unescapeAndSplit(fieldMask[i]);
    const sourceValue = internalGet(sourceObject, path);
    internalSet(result, path, sourceValue);
  }

  return result;
}

export function generateFieldMask(object: unknown): string[] {
  const paths: string[] = [];
  if (!_isObject(object)) {
    return paths;
  }

  _generatePathForObject(object, "", paths);
  return paths;
}

function unescapeAndSplit(originalPath: string) {
  const properties = [];
  let path = originalPath;
  let i = path.indexOf(".");
  while (i >= 0) {
    if (isEscapedDot(path, i)) {
      path = path.replace("\\.", ".");
      i = path.indexOf(".", i);
    } else {
      const firstProperty = path.substring(0, i);
      properties.push(firstProperty.replace(/\\\\/g, "\\"));
      path = path.substring(i + 1);
      i = path.indexOf(".");
    }
  }

  properties.push(path.replace(/\\\\/g, "\\"));
  return properties;
}

function isEscapedDot(path: string, i: number) {
  let counter = 0;
  while (path.substring(i - 1, i) === "\\") {
    counter++;
    i--;
  }

  return counter % 2 === 1;
}

function _generatePathForObject(object: any, path: string, paths: string[]) {
  for (let property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      let expandedPath = path.length > 0 ? path + "." : path;
      expandedPath += property.replace(/\\/g, "\\\\").replace(/\./g, "\\.");

      const objProperty = object[property];

      if (objProperty instanceof Date && !isNaN(objProperty.getTime())) {
        paths.push(expandedPath);
      }

      if (_isObject(objProperty) && !Array.isArray(objProperty)) {
        _generatePathForObject(objProperty, expandedPath, paths);
      } else if (typeof objProperty !== "function") {
        paths.push(expandedPath);
      }
    }
  }
}

function _isObject(object: any) {
  return typeof object === "object" && object !== null;
}

function internalSet(obj: any, path: string[], value: any) {
  if (value === undefined) return;
  path.reduce((acc, part, i) => {
    if (i === path.length - 1) {
      acc[part] = value;
    } else {
      if (!acc[part] || typeof acc[part] !== "object") acc[part] = {};
    }
    return acc[part];
  }, obj);
}

function internalGet(obj: any, parts: string[]) {
  return parts.reduce(
    (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
    obj,
  );
}
