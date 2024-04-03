import * as uuid from "uuid";
import * as dgraph from "dependency-graph";

export const DI_INJECTED = Symbol();

export type InjectedDescriptor<T> = {
  token: string;
  [DI_INJECTED]: T;
};

export type InferInjectedDependencies<
  T extends Record<string, InjectedDescriptor<any>>
> = {
  [K in keyof T]: T[K][typeof DI_INJECTED];
};

type DI_MEMORY_FACTORY_ITEM = {
  dependencies: Record<string, InjectedDescriptor<any>>;
  factory: (d: Record<string, any>) => Promise<any>;
};

export const DI_MEMORY = {
  FACTORIES: new Map<string, DI_MEMORY_FACTORY_ITEM>(),
  RESOLVED: new Map<string, any>(),
};

export function injector<T, D extends Record<string, InjectedDescriptor<any>>>(
  dependencies: D,
  factory: (
    resolvedDependencies: InferInjectedDependencies<D>
  ) => T | Promise<T>
): InjectedDescriptor<T> {
  const token = uuid.v4();

  DI_MEMORY.FACTORIES.set(token, {
    dependencies,
    factory: factory as any,
  });

  return {
    token,
    [DI_INJECTED]: null as T,
  };
}

export async function resolver<T>(injected: InjectedDescriptor<T>) {
  const { FACTORIES, RESOLVED } = DI_MEMORY;
  const graph = new dgraph.DepGraph<DI_MEMORY_FACTORY_ITEM>();

  for (const [root, data] of FACTORIES) {
    graph.addNode(root, data);
  }

  for (const [root, { dependencies }] of FACTORIES) {
    for (const dep of Object.values(dependencies)) {
      graph.addDependency(root, dep.token);
    }
  }

  const resolvedSeq = graph.overallOrder();

  for (const root of resolvedSeq) {
    const { factory, dependencies } = FACTORIES.get(root)!;
    const resolvedDependencies: Record<string, any> = {};

    for (const [name, { token }] of Object.entries(dependencies)) {
      resolvedDependencies[name] = RESOLVED.get(token)!;
    }

    const instance = await factory(resolvedDependencies);
    RESOLVED.set(root, instance);
  }

  return RESOLVED.get(injected.token)! as Promise<T>;
}
