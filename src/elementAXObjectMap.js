/**
 * @flow
 */

import AXObjects from './AXObjectsMap';
import iterationDecorator from './util/iterationDecorator';

type TElementAXObjectTuple = [AXObjectModelRelationConcept, Array<AXObjectName>];
type TElementAXObjects = Array<TElementAXObjectTuple>;

const elementAXObjects: TElementAXObjects = [];

for (let [name, def] of AXObjects.entries()) {
  const relatedConcepts = def.relatedConcepts;
  if (Array.isArray(relatedConcepts)) {
    relatedConcepts.forEach((
      relation,
    ): void => {
      if (relation.module === 'HTML') {
        const concept = relation.concept;
        if (concept != null) {
          const conceptStr = JSON.stringify(concept);
          let axObjects;
          let index = 0;
          for (; index < elementAXObjects.length; index++) {
            const key = elementAXObjects[index][0];
            if (JSON.stringify(key) === conceptStr) {
              axObjects = elementAXObjects[index][1];
              break;
            }
          }
          if (!Array.isArray(axObjects)) {
            axObjects = [];
          }
          const loc = axObjects.findIndex(item => item === name);
          if (loc === -1) {
            axObjects.push(name);
          }
          if (index < elementAXObjects.length) {
            elementAXObjects.splice(index, 1, [concept, axObjects]);
          } else {
            elementAXObjects.push([concept, axObjects]);
          }
        }
      }
    })
  }
}

function conceptsEqual(a: AXObjectModelRelationConcept, b: AXObjectModelRelationConcept) {
  if (typeof a.attributes !== typeof b.attributes) {
    return false;
  }

  if (!a.attributes && !b.attributes) {
    return true;
  }

  const aAttributes = ((a.attributes: any): Array<AXObjectModelRelationConceptAttribute>);
  const bAttributes = ((b.attributes: any): Array<AXObjectModelRelationConceptAttribute>);

  if (aAttributes.length !== bAttributes.length) {
    return false;
  }

  for (let i = 0; i < aAttributes.length; i++) {
    if (
      aAttributes[i].name !== bAttributes[i].name ||
      aAttributes[i].value !== bAttributes[i].value
    ) {
      return false;
    }
  }

  return true;
}

const elementAXObjectMap: TAXObjectQueryMap<
  TElementAXObjects,
  AXObjectModelRelationConcept,
  Array<AXObjectName>,
> = {
  entries: function (): TElementAXObjects {
    return elementAXObjects;
  },
  forEach: function (
    fn: (Array<AXObjectName>, AXObjectModelRelationConcept, TElementAXObjects) => void,
    thisArg: any = null,
  ): void {
    for (let [key, values] of elementAXObjects) {
      fn.call(thisArg, values, key, elementAXObjects);
    }
  },
  get: function (key: AXObjectModelRelationConcept): ?Array<AXObjectName> {
    const item = elementAXObjects.find(tuple => (
      key.name === tuple[0].name && conceptsEqual(key, tuple[0])
    ));
    return item && item[1];
  },
  has: function (key: AXObjectModelRelationConcept): boolean {
    return !!elementAXObjectMap.get(key);
  },
  keys: function (): Array<AXObjectModelRelationConcept> {
    return elementAXObjects.map(([key]) => key);
  },
  values: function (): Array<Array<AXObjectName>> {
    return elementAXObjects.map(([, values]) => values);
  },
};

export default (
  iterationDecorator(
    elementAXObjectMap,
    elementAXObjectMap.entries(),
  ): TAXObjectQueryMap<TElementAXObjects, AXObjectModelRelationConcept, Array<AXObjectName>>
);
