declare type Bindings = {
  APP_ENV: 'local' | 'test' | 'prod';
};

declare type Env = {
  Bindings: Bindings;
};

declare const bindings: Bindings;

declare function getMiniflareBindings<T = Bindings>(): T;
