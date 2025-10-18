/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model AuditLog
 *
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>;
/**
 * Model UserActivity
 *
 */
export type UserActivity =
  $Result.DefaultSelection<Prisma.$UserActivityPayload>;
/**
 * Model SystemEvent
 *
 */
export type SystemEvent = $Result.DefaultSelection<Prisma.$SystemEventPayload>;
/**
 * Model Client
 *
 */
export type Client = $Result.DefaultSelection<Prisma.$ClientPayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const TipoEntidad: {
    Cliente: 'Cliente';
    Proveedor: 'Proveedor';
    Ambos: 'Ambos';
  };

  export type TipoEntidad = (typeof TipoEntidad)[keyof typeof TipoEntidad];
}

export type TipoEntidad = $Enums.TipoEntidad;

export const TipoEntidad: typeof $Enums.TipoEntidad;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  );
  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent,
    ) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more AuditLogs
   * const auditLogs = await prisma.auditLog.findMany()
   * ```
   */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userActivity`: Exposes CRUD operations for the **UserActivity** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more UserActivities
   * const userActivities = await prisma.userActivity.findMany()
   * ```
   */
  get userActivity(): Prisma.UserActivityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.systemEvent`: Exposes CRUD operations for the **SystemEvent** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more SystemEvents
   * const systemEvents = await prisma.systemEvent.findMany()
   * ```
   */
  get systemEvent(): Prisma.SystemEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.client`: Exposes CRUD operations for the **Client** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Clients
   * const clients = await prisma.client.findMany()
   * ```
   */
  get client(): Prisma.ClientDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends bigint
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    User: 'User';
    AuditLog: 'AuditLog';
    UserActivity: 'UserActivity';
    SystemEvent: 'SystemEvent';
    Client: 'Client';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}>
    extends $Utils.Fn<
      { extArgs: $Extensions.InternalArgs },
      $Utils.Record<string, any>
    > {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps:
        | 'user'
        | 'auditLog'
        | 'userActivity'
        | 'systemEvent'
        | 'client';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>;
        fields: Prisma.AuditLogFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
          };
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
          };
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
          };
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>;
          };
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAuditLog>;
          };
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AuditLogGroupByOutputType>[];
          };
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>;
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number;
          };
        };
      };
      UserActivity: {
        payload: Prisma.$UserActivityPayload<ExtArgs>;
        fields: Prisma.UserActivityFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserActivityFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserActivityFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>;
          };
          findFirst: {
            args: Prisma.UserActivityFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserActivityFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>;
          };
          findMany: {
            args: Prisma.UserActivityFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>[];
          };
          create: {
            args: Prisma.UserActivityCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>;
          };
          createMany: {
            args: Prisma.UserActivityCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserActivityCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>[];
          };
          delete: {
            args: Prisma.UserActivityDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>;
          };
          update: {
            args: Prisma.UserActivityUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>;
          };
          deleteMany: {
            args: Prisma.UserActivityDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserActivityUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserActivityUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>[];
          };
          upsert: {
            args: Prisma.UserActivityUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserActivityPayload>;
          };
          aggregate: {
            args: Prisma.UserActivityAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUserActivity>;
          };
          groupBy: {
            args: Prisma.UserActivityGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserActivityGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserActivityCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<UserActivityCountAggregateOutputType>
              | number;
          };
        };
      };
      SystemEvent: {
        payload: Prisma.$SystemEventPayload<ExtArgs>;
        fields: Prisma.SystemEventFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.SystemEventFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.SystemEventFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>;
          };
          findFirst: {
            args: Prisma.SystemEventFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.SystemEventFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>;
          };
          findMany: {
            args: Prisma.SystemEventFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>[];
          };
          create: {
            args: Prisma.SystemEventCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>;
          };
          createMany: {
            args: Prisma.SystemEventCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.SystemEventCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>[];
          };
          delete: {
            args: Prisma.SystemEventDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>;
          };
          update: {
            args: Prisma.SystemEventUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>;
          };
          deleteMany: {
            args: Prisma.SystemEventDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.SystemEventUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.SystemEventUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>[];
          };
          upsert: {
            args: Prisma.SystemEventUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SystemEventPayload>;
          };
          aggregate: {
            args: Prisma.SystemEventAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateSystemEvent>;
          };
          groupBy: {
            args: Prisma.SystemEventGroupByArgs<ExtArgs>;
            result: $Utils.Optional<SystemEventGroupByOutputType>[];
          };
          count: {
            args: Prisma.SystemEventCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<SystemEventCountAggregateOutputType>
              | number;
          };
        };
      };
      Client: {
        payload: Prisma.$ClientPayload<ExtArgs>;
        fields: Prisma.ClientFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ClientFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ClientFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>;
          };
          findFirst: {
            args: Prisma.ClientFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ClientFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>;
          };
          findMany: {
            args: Prisma.ClientFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[];
          };
          create: {
            args: Prisma.ClientCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>;
          };
          createMany: {
            args: Prisma.ClientCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ClientCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[];
          };
          delete: {
            args: Prisma.ClientDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>;
          };
          update: {
            args: Prisma.ClientUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>;
          };
          deleteMany: {
            args: Prisma.ClientDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ClientUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ClientUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[];
          };
          upsert: {
            args: Prisma.ClientUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>;
          };
          aggregate: {
            args: Prisma.ClientAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateClient>;
          };
          groupBy: {
            args: Prisma.ClientGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ClientGroupByOutputType>[];
          };
          count: {
            args: Prisma.ClientCountArgs<ExtArgs>;
            result: $Utils.Optional<ClientCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null;
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    user?: UserOmit;
    auditLog?: AuditLogOmit;
    userActivity?: UserActivityOmit;
    systemEvent?: SystemEventOmit;
    client?: ClientOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>,
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    auditLogs: number;
    userActivities: number;
    clientsCreated: number;
    clientsUpdated: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    auditLogs?: boolean | UserCountOutputTypeCountAuditLogsArgs;
    userActivities?: boolean | UserCountOutputTypeCountUserActivitiesArgs;
    clientsCreated?: boolean | UserCountOutputTypeCountClientsCreatedArgs;
    clientsUpdated?: boolean | UserCountOutputTypeCountClientsUpdatedArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuditLogsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AuditLogWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserActivitiesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserActivityWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClientsCreatedArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ClientWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClientsUpdatedArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ClientWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    username: string | null;
    password: string | null;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    lastAccess: Date | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    username: string | null;
    password: string | null;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    lastAccess: Date | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    username: number;
    password: number;
    firstName: number;
    lastName: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    lastAccess: number;
    permissions: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    username?: true;
    password?: true;
    firstName?: true;
    lastName?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    lastAccess?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    username?: true;
    password?: true;
    firstName?: true;
    lastName?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    lastAccess?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    username?: true;
    password?: true;
    firstName?: true;
    lastName?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    lastAccess?: true;
    permissions?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserWhereInput;
    orderBy?:
      | UserOrderByWithAggregationInput
      | UserOrderByWithAggregationInput[];
    by: UserScalarFieldEnum[] | UserScalarFieldEnum;
    having?: UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
  };

  export type UserGroupByOutputType = {
    id: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastAccess: Date | null;
    permissions: string[];
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      username?: boolean;
      password?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      lastAccess?: boolean;
      permissions?: boolean;
      auditLogs?: boolean | User$auditLogsArgs<ExtArgs>;
      userActivities?: boolean | User$userActivitiesArgs<ExtArgs>;
      clientsCreated?: boolean | User$clientsCreatedArgs<ExtArgs>;
      clientsUpdated?: boolean | User$clientsUpdatedArgs<ExtArgs>;
      _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      username?: boolean;
      password?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      lastAccess?: boolean;
      permissions?: boolean;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      email?: boolean;
      username?: boolean;
      password?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      lastAccess?: boolean;
      permissions?: boolean;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    username?: boolean;
    password?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    lastAccess?: boolean;
    permissions?: boolean;
  };

  export type UserOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'email'
    | 'username'
    | 'password'
    | 'firstName'
    | 'lastName'
    | 'isActive'
    | 'createdAt'
    | 'updatedAt'
    | 'lastAccess'
    | 'permissions',
    ExtArgs['result']['user']
  >;
  export type UserInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    auditLogs?: boolean | User$auditLogsArgs<ExtArgs>;
    userActivities?: boolean | User$userActivitiesArgs<ExtArgs>;
    clientsCreated?: boolean | User$clientsCreatedArgs<ExtArgs>;
    clientsUpdated?: boolean | User$clientsUpdatedArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type UserIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'User';
    objects: {
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[];
      userActivities: Prisma.$UserActivityPayload<ExtArgs>[];
      clientsCreated: Prisma.$ClientPayload<ExtArgs>[];
      clientsUpdated: Prisma.$ClientPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastAccess: Date | null;
        permissions: string[];
      },
      ExtArgs['result']['user']
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> =
    $Result.GetResult<Prisma.$UserPayload, S>;

  type UserCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['User'];
      meta: { name: 'User' };
    };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetUserGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    auditLogs<T extends User$auditLogsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$auditLogsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$AuditLogPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    userActivities<T extends User$userActivitiesArgs<ExtArgs> = {}>(
      args?: Subset<T, User$userActivitiesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$UserActivityPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    clientsCreated<T extends User$clientsCreatedArgs<ExtArgs> = {}>(
      args?: Subset<T, User$clientsCreatedArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$ClientPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    clientsUpdated<T extends User$clientsUpdatedArgs<ExtArgs> = {}>(
      args?: Subset<T, User$clientsUpdatedArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$ClientPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<'User', 'String'>;
    readonly email: FieldRef<'User', 'String'>;
    readonly username: FieldRef<'User', 'String'>;
    readonly password: FieldRef<'User', 'String'>;
    readonly firstName: FieldRef<'User', 'String'>;
    readonly lastName: FieldRef<'User', 'String'>;
    readonly isActive: FieldRef<'User', 'Boolean'>;
    readonly createdAt: FieldRef<'User', 'DateTime'>;
    readonly updatedAt: FieldRef<'User', 'DateTime'>;
    readonly lastAccess: FieldRef<'User', 'DateTime'>;
    readonly permissions: FieldRef<'User', 'String[]'>;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User create
   */
  export type UserCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to delete.
     */
    limit?: number;
  };

  /**
   * User.auditLogs
   */
  export type User$auditLogsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    where?: AuditLogWhereInput;
    orderBy?:
      | AuditLogOrderByWithRelationInput
      | AuditLogOrderByWithRelationInput[];
    cursor?: AuditLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * User.userActivities
   */
  export type User$userActivitiesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    where?: UserActivityWhereInput;
    orderBy?:
      | UserActivityOrderByWithRelationInput
      | UserActivityOrderByWithRelationInput[];
    cursor?: UserActivityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: UserActivityScalarFieldEnum | UserActivityScalarFieldEnum[];
  };

  /**
   * User.clientsCreated
   */
  export type User$clientsCreatedArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    where?: ClientWhereInput;
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[];
    cursor?: ClientWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[];
  };

  /**
   * User.clientsUpdated
   */
  export type User$clientsUpdatedArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    where?: ClientWhereInput;
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[];
    cursor?: ClientWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
  };

  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null;
    _min: AuditLogMinAggregateOutputType | null;
    _max: AuditLogMaxAggregateOutputType | null;
  };

  export type AuditLogMinAggregateOutputType = {
    id: string | null;
    action: string | null;
    userId: string | null;
    targetId: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
  };

  export type AuditLogMaxAggregateOutputType = {
    id: string | null;
    action: string | null;
    userId: string | null;
    targetId: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
  };

  export type AuditLogCountAggregateOutputType = {
    id: number;
    action: number;
    userId: number;
    targetId: number;
    details: number;
    ipAddress: number;
    userAgent: number;
    createdAt: number;
    _all: number;
  };

  export type AuditLogMinAggregateInputType = {
    id?: true;
    action?: true;
    userId?: true;
    targetId?: true;
    details?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
  };

  export type AuditLogMaxAggregateInputType = {
    id?: true;
    action?: true;
    userId?: true;
    targetId?: true;
    details?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
  };

  export type AuditLogCountAggregateInputType = {
    id?: true;
    action?: true;
    userId?: true;
    targetId?: true;
    details?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
    _all?: true;
  };

  export type AuditLogAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?:
      | AuditLogOrderByWithRelationInput
      | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AuditLogs
     **/
    _count?: true | AuditLogCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: AuditLogMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: AuditLogMaxAggregateInputType;
  };

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
    [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>;
  };

  export type AuditLogGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AuditLogWhereInput;
    orderBy?:
      | AuditLogOrderByWithAggregationInput
      | AuditLogOrderByWithAggregationInput[];
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum;
    having?: AuditLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuditLogCountAggregateInputType | true;
    _min?: AuditLogMinAggregateInputType;
    _max?: AuditLogMaxAggregateInputType;
  };

  export type AuditLogGroupByOutputType = {
    id: string;
    action: string;
    userId: string | null;
    targetId: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    _count: AuditLogCountAggregateOutputType | null;
    _min: AuditLogMinAggregateOutputType | null;
    _max: AuditLogMaxAggregateOutputType | null;
  };

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<AuditLogGroupByOutputType, T['by']> & {
          [P in keyof T & keyof AuditLogGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>;
        }
      >
    >;

  export type AuditLogSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      action?: boolean;
      userId?: boolean;
      targetId?: boolean;
      details?: boolean;
      ipAddress?: boolean;
      userAgent?: boolean;
      createdAt?: boolean;
      user?: boolean | AuditLog$userArgs<ExtArgs>;
    },
    ExtArgs['result']['auditLog']
  >;

  export type AuditLogSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      action?: boolean;
      userId?: boolean;
      targetId?: boolean;
      details?: boolean;
      ipAddress?: boolean;
      userAgent?: boolean;
      createdAt?: boolean;
      user?: boolean | AuditLog$userArgs<ExtArgs>;
    },
    ExtArgs['result']['auditLog']
  >;

  export type AuditLogSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      action?: boolean;
      userId?: boolean;
      targetId?: boolean;
      details?: boolean;
      ipAddress?: boolean;
      userAgent?: boolean;
      createdAt?: boolean;
      user?: boolean | AuditLog$userArgs<ExtArgs>;
    },
    ExtArgs['result']['auditLog']
  >;

  export type AuditLogSelectScalar = {
    id?: boolean;
    action?: boolean;
    userId?: boolean;
    targetId?: boolean;
    details?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
  };

  export type AuditLogOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'action'
    | 'userId'
    | 'targetId'
    | 'details'
    | 'ipAddress'
    | 'userAgent'
    | 'createdAt',
    ExtArgs['result']['auditLog']
  >;
  export type AuditLogInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | AuditLog$userArgs<ExtArgs>;
  };
  export type AuditLogIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | AuditLog$userArgs<ExtArgs>;
  };
  export type AuditLogIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | AuditLog$userArgs<ExtArgs>;
  };

  export type $AuditLogPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'AuditLog';
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        action: string;
        userId: string | null;
        targetId: string | null;
        details: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      },
      ExtArgs['result']['auditLog']
    >;
    composites: {};
  };

  type AuditLogGetPayload<
    S extends boolean | null | undefined | AuditLogDefaultArgs,
  > = $Result.GetResult<Prisma.$AuditLogPayload, S>;

  type AuditLogCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AuditLogCountAggregateInputType | true;
  };

  export interface AuditLogDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'];
      meta: { name: 'AuditLog' };
    };
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(
      args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(
      args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(
      args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     *
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AuditLogFindManyArgs>(
      args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     *
     */
    create<T extends AuditLogCreateArgs>(
      args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AuditLogCreateManyArgs>(
      args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(
      args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     *
     */
    delete<T extends AuditLogDeleteArgs>(
      args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AuditLogUpdateArgs>(
      args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(
      args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AuditLogUpdateManyArgs>(
      args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(
      args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(
      args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>,
    ): Prisma__AuditLogClient<
      $Result.GetResult<
        Prisma.$AuditLogPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
     **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends AuditLogAggregateArgs>(
      args: Subset<T, AuditLogAggregateArgs>,
    ): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>;

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetAuditLogGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AuditLog model
     */
    readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    user<T extends AuditLog$userArgs<ExtArgs> = {}>(
      args?: Subset<T, AuditLog$userArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<'AuditLog', 'String'>;
    readonly action: FieldRef<'AuditLog', 'String'>;
    readonly userId: FieldRef<'AuditLog', 'String'>;
    readonly targetId: FieldRef<'AuditLog', 'String'>;
    readonly details: FieldRef<'AuditLog', 'String'>;
    readonly ipAddress: FieldRef<'AuditLog', 'String'>;
    readonly userAgent: FieldRef<'AuditLog', 'String'>;
    readonly createdAt: FieldRef<'AuditLog', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?:
      | AuditLogOrderByWithRelationInput
      | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?:
      | AuditLogOrderByWithRelationInput
      | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?:
      | AuditLogOrderByWithRelationInput
      | AuditLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AuditLogs.
     */
    skip?: number;
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[];
  };

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>;
  };

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>;
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<
      AuditLogUpdateManyMutationInput,
      AuditLogUncheckedUpdateManyInput
    >;
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput;
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number;
  };

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<
      AuditLogUpdateManyMutationInput,
      AuditLogUncheckedUpdateManyInput
    >;
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput;
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput;
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>;
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>;
  };

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput;
  };

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput;
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number;
  };

  /**
   * AuditLog.user
   */
  export type AuditLog$userArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    where?: UserWhereInput;
  };

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null;
  };

  /**
   * Model UserActivity
   */

  export type AggregateUserActivity = {
    _count: UserActivityCountAggregateOutputType | null;
    _min: UserActivityMinAggregateOutputType | null;
    _max: UserActivityMaxAggregateOutputType | null;
  };

  export type UserActivityMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    action: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
  };

  export type UserActivityMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    action: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
  };

  export type UserActivityCountAggregateOutputType = {
    id: number;
    userId: number;
    action: number;
    details: number;
    ipAddress: number;
    userAgent: number;
    createdAt: number;
    _all: number;
  };

  export type UserActivityMinAggregateInputType = {
    id?: true;
    userId?: true;
    action?: true;
    details?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
  };

  export type UserActivityMaxAggregateInputType = {
    id?: true;
    userId?: true;
    action?: true;
    details?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
  };

  export type UserActivityCountAggregateInputType = {
    id?: true;
    userId?: true;
    action?: true;
    details?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
    _all?: true;
  };

  export type UserActivityAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which UserActivity to aggregate.
     */
    where?: UserActivityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserActivities to fetch.
     */
    orderBy?:
      | UserActivityOrderByWithRelationInput
      | UserActivityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserActivityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserActivities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserActivities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UserActivities
     **/
    _count?: true | UserActivityCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserActivityMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserActivityMaxAggregateInputType;
  };

  export type GetUserActivityAggregateType<
    T extends UserActivityAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateUserActivity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserActivity[P]>
      : GetScalarType<T[P], AggregateUserActivity[P]>;
  };

  export type UserActivityGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserActivityWhereInput;
    orderBy?:
      | UserActivityOrderByWithAggregationInput
      | UserActivityOrderByWithAggregationInput[];
    by: UserActivityScalarFieldEnum[] | UserActivityScalarFieldEnum;
    having?: UserActivityScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserActivityCountAggregateInputType | true;
    _min?: UserActivityMinAggregateInputType;
    _max?: UserActivityMaxAggregateInputType;
  };

  export type UserActivityGroupByOutputType = {
    id: string;
    userId: string;
    action: string;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    _count: UserActivityCountAggregateOutputType | null;
    _min: UserActivityMinAggregateOutputType | null;
    _max: UserActivityMaxAggregateOutputType | null;
  };

  type GetUserActivityGroupByPayload<T extends UserActivityGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<UserActivityGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof UserActivityGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserActivityGroupByOutputType[P]>
            : GetScalarType<T[P], UserActivityGroupByOutputType[P]>;
        }
      >
    >;

  export type UserActivitySelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      action?: boolean;
      details?: boolean;
      ipAddress?: boolean;
      userAgent?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['userActivity']
  >;

  export type UserActivitySelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      action?: boolean;
      details?: boolean;
      ipAddress?: boolean;
      userAgent?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['userActivity']
  >;

  export type UserActivitySelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      action?: boolean;
      details?: boolean;
      ipAddress?: boolean;
      userAgent?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['userActivity']
  >;

  export type UserActivitySelectScalar = {
    id?: boolean;
    userId?: boolean;
    action?: boolean;
    details?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
  };

  export type UserActivityOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'userId'
    | 'action'
    | 'details'
    | 'ipAddress'
    | 'userAgent'
    | 'createdAt',
    ExtArgs['result']['userActivity']
  >;
  export type UserActivityInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type UserActivityIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type UserActivityIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $UserActivityPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'UserActivity';
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        action: string;
        details: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      },
      ExtArgs['result']['userActivity']
    >;
    composites: {};
  };

  type UserActivityGetPayload<
    S extends boolean | null | undefined | UserActivityDefaultArgs,
  > = $Result.GetResult<Prisma.$UserActivityPayload, S>;

  type UserActivityCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    UserActivityFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: UserActivityCountAggregateInputType | true;
  };

  export interface UserActivityDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['UserActivity'];
      meta: { name: 'UserActivity' };
    };
    /**
     * Find zero or one UserActivity that matches the filter.
     * @param {UserActivityFindUniqueArgs} args - Arguments to find a UserActivity
     * @example
     * // Get one UserActivity
     * const userActivity = await prisma.userActivity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserActivityFindUniqueArgs>(
      args: SelectSubset<T, UserActivityFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one UserActivity that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserActivityFindUniqueOrThrowArgs} args - Arguments to find a UserActivity
     * @example
     * // Get one UserActivity
     * const userActivity = await prisma.userActivity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserActivityFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserActivityFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first UserActivity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityFindFirstArgs} args - Arguments to find a UserActivity
     * @example
     * // Get one UserActivity
     * const userActivity = await prisma.userActivity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserActivityFindFirstArgs>(
      args?: SelectSubset<T, UserActivityFindFirstArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first UserActivity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityFindFirstOrThrowArgs} args - Arguments to find a UserActivity
     * @example
     * // Get one UserActivity
     * const userActivity = await prisma.userActivity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserActivityFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserActivityFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more UserActivities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserActivities
     * const userActivities = await prisma.userActivity.findMany()
     *
     * // Get first 10 UserActivities
     * const userActivities = await prisma.userActivity.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userActivityWithIdOnly = await prisma.userActivity.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserActivityFindManyArgs>(
      args?: SelectSubset<T, UserActivityFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a UserActivity.
     * @param {UserActivityCreateArgs} args - Arguments to create a UserActivity.
     * @example
     * // Create one UserActivity
     * const UserActivity = await prisma.userActivity.create({
     *   data: {
     *     // ... data to create a UserActivity
     *   }
     * })
     *
     */
    create<T extends UserActivityCreateArgs>(
      args: SelectSubset<T, UserActivityCreateArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many UserActivities.
     * @param {UserActivityCreateManyArgs} args - Arguments to create many UserActivities.
     * @example
     * // Create many UserActivities
     * const userActivity = await prisma.userActivity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserActivityCreateManyArgs>(
      args?: SelectSubset<T, UserActivityCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many UserActivities and returns the data saved in the database.
     * @param {UserActivityCreateManyAndReturnArgs} args - Arguments to create many UserActivities.
     * @example
     * // Create many UserActivities
     * const userActivity = await prisma.userActivity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UserActivities and only return the `id`
     * const userActivityWithIdOnly = await prisma.userActivity.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserActivityCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserActivityCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a UserActivity.
     * @param {UserActivityDeleteArgs} args - Arguments to delete one UserActivity.
     * @example
     * // Delete one UserActivity
     * const UserActivity = await prisma.userActivity.delete({
     *   where: {
     *     // ... filter to delete one UserActivity
     *   }
     * })
     *
     */
    delete<T extends UserActivityDeleteArgs>(
      args: SelectSubset<T, UserActivityDeleteArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one UserActivity.
     * @param {UserActivityUpdateArgs} args - Arguments to update one UserActivity.
     * @example
     * // Update one UserActivity
     * const userActivity = await prisma.userActivity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserActivityUpdateArgs>(
      args: SelectSubset<T, UserActivityUpdateArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more UserActivities.
     * @param {UserActivityDeleteManyArgs} args - Arguments to filter UserActivities to delete.
     * @example
     * // Delete a few UserActivities
     * const { count } = await prisma.userActivity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserActivityDeleteManyArgs>(
      args?: SelectSubset<T, UserActivityDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserActivities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserActivities
     * const userActivity = await prisma.userActivity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserActivityUpdateManyArgs>(
      args: SelectSubset<T, UserActivityUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more UserActivities and returns the data updated in the database.
     * @param {UserActivityUpdateManyAndReturnArgs} args - Arguments to update many UserActivities.
     * @example
     * // Update many UserActivities
     * const userActivity = await prisma.userActivity.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more UserActivities and only return the `id`
     * const userActivityWithIdOnly = await prisma.userActivity.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserActivityUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserActivityUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one UserActivity.
     * @param {UserActivityUpsertArgs} args - Arguments to update or create a UserActivity.
     * @example
     * // Update or create a UserActivity
     * const userActivity = await prisma.userActivity.upsert({
     *   create: {
     *     // ... data to create a UserActivity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserActivity we want to update
     *   }
     * })
     */
    upsert<T extends UserActivityUpsertArgs>(
      args: SelectSubset<T, UserActivityUpsertArgs<ExtArgs>>,
    ): Prisma__UserActivityClient<
      $Result.GetResult<
        Prisma.$UserActivityPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of UserActivities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityCountArgs} args - Arguments to filter UserActivities to count.
     * @example
     * // Count the number of UserActivities
     * const count = await prisma.userActivity.count({
     *   where: {
     *     // ... the filter for the UserActivities we want to count
     *   }
     * })
     **/
    count<T extends UserActivityCountArgs>(
      args?: Subset<T, UserActivityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserActivityCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a UserActivity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserActivityAggregateArgs>(
      args: Subset<T, UserActivityAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserActivityAggregateType<T>>;

    /**
     * Group by UserActivity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserActivityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserActivityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserActivityGroupByArgs['orderBy'] }
        : { orderBy?: UserActivityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserActivityGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetUserActivityGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UserActivity model
     */
    readonly fields: UserActivityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserActivity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserActivityClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | $Result.GetResult<
          Prisma.$UserPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the UserActivity model
   */
  interface UserActivityFieldRefs {
    readonly id: FieldRef<'UserActivity', 'String'>;
    readonly userId: FieldRef<'UserActivity', 'String'>;
    readonly action: FieldRef<'UserActivity', 'String'>;
    readonly details: FieldRef<'UserActivity', 'String'>;
    readonly ipAddress: FieldRef<'UserActivity', 'String'>;
    readonly userAgent: FieldRef<'UserActivity', 'String'>;
    readonly createdAt: FieldRef<'UserActivity', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * UserActivity findUnique
   */
  export type UserActivityFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * Filter, which UserActivity to fetch.
     */
    where: UserActivityWhereUniqueInput;
  };

  /**
   * UserActivity findUniqueOrThrow
   */
  export type UserActivityFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * Filter, which UserActivity to fetch.
     */
    where: UserActivityWhereUniqueInput;
  };

  /**
   * UserActivity findFirst
   */
  export type UserActivityFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * Filter, which UserActivity to fetch.
     */
    where?: UserActivityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserActivities to fetch.
     */
    orderBy?:
      | UserActivityOrderByWithRelationInput
      | UserActivityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserActivities.
     */
    cursor?: UserActivityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserActivities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserActivities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserActivities.
     */
    distinct?: UserActivityScalarFieldEnum | UserActivityScalarFieldEnum[];
  };

  /**
   * UserActivity findFirstOrThrow
   */
  export type UserActivityFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * Filter, which UserActivity to fetch.
     */
    where?: UserActivityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserActivities to fetch.
     */
    orderBy?:
      | UserActivityOrderByWithRelationInput
      | UserActivityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserActivities.
     */
    cursor?: UserActivityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserActivities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserActivities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserActivities.
     */
    distinct?: UserActivityScalarFieldEnum | UserActivityScalarFieldEnum[];
  };

  /**
   * UserActivity findMany
   */
  export type UserActivityFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * Filter, which UserActivities to fetch.
     */
    where?: UserActivityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserActivities to fetch.
     */
    orderBy?:
      | UserActivityOrderByWithRelationInput
      | UserActivityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UserActivities.
     */
    cursor?: UserActivityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserActivities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserActivities.
     */
    skip?: number;
    distinct?: UserActivityScalarFieldEnum | UserActivityScalarFieldEnum[];
  };

  /**
   * UserActivity create
   */
  export type UserActivityCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * The data needed to create a UserActivity.
     */
    data: XOR<UserActivityCreateInput, UserActivityUncheckedCreateInput>;
  };

  /**
   * UserActivity createMany
   */
  export type UserActivityCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many UserActivities.
     */
    data: UserActivityCreateManyInput | UserActivityCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * UserActivity createManyAndReturn
   */
  export type UserActivityCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * The data used to create many UserActivities.
     */
    data: UserActivityCreateManyInput | UserActivityCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * UserActivity update
   */
  export type UserActivityUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * The data needed to update a UserActivity.
     */
    data: XOR<UserActivityUpdateInput, UserActivityUncheckedUpdateInput>;
    /**
     * Choose, which UserActivity to update.
     */
    where: UserActivityWhereUniqueInput;
  };

  /**
   * UserActivity updateMany
   */
  export type UserActivityUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update UserActivities.
     */
    data: XOR<
      UserActivityUpdateManyMutationInput,
      UserActivityUncheckedUpdateManyInput
    >;
    /**
     * Filter which UserActivities to update
     */
    where?: UserActivityWhereInput;
    /**
     * Limit how many UserActivities to update.
     */
    limit?: number;
  };

  /**
   * UserActivity updateManyAndReturn
   */
  export type UserActivityUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * The data used to update UserActivities.
     */
    data: XOR<
      UserActivityUpdateManyMutationInput,
      UserActivityUncheckedUpdateManyInput
    >;
    /**
     * Filter which UserActivities to update
     */
    where?: UserActivityWhereInput;
    /**
     * Limit how many UserActivities to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * UserActivity upsert
   */
  export type UserActivityUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * The filter to search for the UserActivity to update in case it exists.
     */
    where: UserActivityWhereUniqueInput;
    /**
     * In case the UserActivity found by the `where` argument doesn't exist, create a new UserActivity with this data.
     */
    create: XOR<UserActivityCreateInput, UserActivityUncheckedCreateInput>;
    /**
     * In case the UserActivity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserActivityUpdateInput, UserActivityUncheckedUpdateInput>;
  };

  /**
   * UserActivity delete
   */
  export type UserActivityDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
    /**
     * Filter which UserActivity to delete.
     */
    where: UserActivityWhereUniqueInput;
  };

  /**
   * UserActivity deleteMany
   */
  export type UserActivityDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which UserActivities to delete
     */
    where?: UserActivityWhereInput;
    /**
     * Limit how many UserActivities to delete.
     */
    limit?: number;
  };

  /**
   * UserActivity without action
   */
  export type UserActivityDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserActivity
     */
    select?: UserActivitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserActivity
     */
    omit?: UserActivityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserActivityInclude<ExtArgs> | null;
  };

  /**
   * Model SystemEvent
   */

  export type AggregateSystemEvent = {
    _count: SystemEventCountAggregateOutputType | null;
    _min: SystemEventMinAggregateOutputType | null;
    _max: SystemEventMaxAggregateOutputType | null;
  };

  export type SystemEventMinAggregateOutputType = {
    id: string | null;
    type: string | null;
    details: string | null;
    createdAt: Date | null;
  };

  export type SystemEventMaxAggregateOutputType = {
    id: string | null;
    type: string | null;
    details: string | null;
    createdAt: Date | null;
  };

  export type SystemEventCountAggregateOutputType = {
    id: number;
    type: number;
    details: number;
    metadata: number;
    createdAt: number;
    _all: number;
  };

  export type SystemEventMinAggregateInputType = {
    id?: true;
    type?: true;
    details?: true;
    createdAt?: true;
  };

  export type SystemEventMaxAggregateInputType = {
    id?: true;
    type?: true;
    details?: true;
    createdAt?: true;
  };

  export type SystemEventCountAggregateInputType = {
    id?: true;
    type?: true;
    details?: true;
    metadata?: true;
    createdAt?: true;
    _all?: true;
  };

  export type SystemEventAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which SystemEvent to aggregate.
     */
    where?: SystemEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SystemEvents to fetch.
     */
    orderBy?:
      | SystemEventOrderByWithRelationInput
      | SystemEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: SystemEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SystemEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SystemEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned SystemEvents
     **/
    _count?: true | SystemEventCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: SystemEventMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: SystemEventMaxAggregateInputType;
  };

  export type GetSystemEventAggregateType<T extends SystemEventAggregateArgs> =
    {
      [P in keyof T & keyof AggregateSystemEvent]: P extends '_count' | 'count'
        ? T[P] extends true
          ? number
          : GetScalarType<T[P], AggregateSystemEvent[P]>
        : GetScalarType<T[P], AggregateSystemEvent[P]>;
    };

  export type SystemEventGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SystemEventWhereInput;
    orderBy?:
      | SystemEventOrderByWithAggregationInput
      | SystemEventOrderByWithAggregationInput[];
    by: SystemEventScalarFieldEnum[] | SystemEventScalarFieldEnum;
    having?: SystemEventScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SystemEventCountAggregateInputType | true;
    _min?: SystemEventMinAggregateInputType;
    _max?: SystemEventMaxAggregateInputType;
  };

  export type SystemEventGroupByOutputType = {
    id: string;
    type: string;
    details: string | null;
    metadata: JsonValue | null;
    createdAt: Date;
    _count: SystemEventCountAggregateOutputType | null;
    _min: SystemEventMinAggregateOutputType | null;
    _max: SystemEventMaxAggregateOutputType | null;
  };

  type GetSystemEventGroupByPayload<T extends SystemEventGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<SystemEventGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof SystemEventGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemEventGroupByOutputType[P]>
            : GetScalarType<T[P], SystemEventGroupByOutputType[P]>;
        }
      >
    >;

  export type SystemEventSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      type?: boolean;
      details?: boolean;
      metadata?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['systemEvent']
  >;

  export type SystemEventSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      type?: boolean;
      details?: boolean;
      metadata?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['systemEvent']
  >;

  export type SystemEventSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      type?: boolean;
      details?: boolean;
      metadata?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['systemEvent']
  >;

  export type SystemEventSelectScalar = {
    id?: boolean;
    type?: boolean;
    details?: boolean;
    metadata?: boolean;
    createdAt?: boolean;
  };

  export type SystemEventOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'id' | 'type' | 'details' | 'metadata' | 'createdAt',
    ExtArgs['result']['systemEvent']
  >;

  export type $SystemEventPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'SystemEvent';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        type: string;
        details: string | null;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
      },
      ExtArgs['result']['systemEvent']
    >;
    composites: {};
  };

  type SystemEventGetPayload<
    S extends boolean | null | undefined | SystemEventDefaultArgs,
  > = $Result.GetResult<Prisma.$SystemEventPayload, S>;

  type SystemEventCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    SystemEventFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: SystemEventCountAggregateInputType | true;
  };

  export interface SystemEventDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['SystemEvent'];
      meta: { name: 'SystemEvent' };
    };
    /**
     * Find zero or one SystemEvent that matches the filter.
     * @param {SystemEventFindUniqueArgs} args - Arguments to find a SystemEvent
     * @example
     * // Get one SystemEvent
     * const systemEvent = await prisma.systemEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemEventFindUniqueArgs>(
      args: SelectSubset<T, SystemEventFindUniqueArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one SystemEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SystemEventFindUniqueOrThrowArgs} args - Arguments to find a SystemEvent
     * @example
     * // Get one SystemEvent
     * const systemEvent = await prisma.systemEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemEventFindUniqueOrThrowArgs>(
      args: SelectSubset<T, SystemEventFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first SystemEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventFindFirstArgs} args - Arguments to find a SystemEvent
     * @example
     * // Get one SystemEvent
     * const systemEvent = await prisma.systemEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemEventFindFirstArgs>(
      args?: SelectSubset<T, SystemEventFindFirstArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first SystemEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventFindFirstOrThrowArgs} args - Arguments to find a SystemEvent
     * @example
     * // Get one SystemEvent
     * const systemEvent = await prisma.systemEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemEventFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SystemEventFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more SystemEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemEvents
     * const systemEvents = await prisma.systemEvent.findMany()
     *
     * // Get first 10 SystemEvents
     * const systemEvents = await prisma.systemEvent.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const systemEventWithIdOnly = await prisma.systemEvent.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SystemEventFindManyArgs>(
      args?: SelectSubset<T, SystemEventFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a SystemEvent.
     * @param {SystemEventCreateArgs} args - Arguments to create a SystemEvent.
     * @example
     * // Create one SystemEvent
     * const SystemEvent = await prisma.systemEvent.create({
     *   data: {
     *     // ... data to create a SystemEvent
     *   }
     * })
     *
     */
    create<T extends SystemEventCreateArgs>(
      args: SelectSubset<T, SystemEventCreateArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many SystemEvents.
     * @param {SystemEventCreateManyArgs} args - Arguments to create many SystemEvents.
     * @example
     * // Create many SystemEvents
     * const systemEvent = await prisma.systemEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SystemEventCreateManyArgs>(
      args?: SelectSubset<T, SystemEventCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many SystemEvents and returns the data saved in the database.
     * @param {SystemEventCreateManyAndReturnArgs} args - Arguments to create many SystemEvents.
     * @example
     * // Create many SystemEvents
     * const systemEvent = await prisma.systemEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many SystemEvents and only return the `id`
     * const systemEventWithIdOnly = await prisma.systemEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SystemEventCreateManyAndReturnArgs>(
      args?: SelectSubset<T, SystemEventCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a SystemEvent.
     * @param {SystemEventDeleteArgs} args - Arguments to delete one SystemEvent.
     * @example
     * // Delete one SystemEvent
     * const SystemEvent = await prisma.systemEvent.delete({
     *   where: {
     *     // ... filter to delete one SystemEvent
     *   }
     * })
     *
     */
    delete<T extends SystemEventDeleteArgs>(
      args: SelectSubset<T, SystemEventDeleteArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one SystemEvent.
     * @param {SystemEventUpdateArgs} args - Arguments to update one SystemEvent.
     * @example
     * // Update one SystemEvent
     * const systemEvent = await prisma.systemEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SystemEventUpdateArgs>(
      args: SelectSubset<T, SystemEventUpdateArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more SystemEvents.
     * @param {SystemEventDeleteManyArgs} args - Arguments to filter SystemEvents to delete.
     * @example
     * // Delete a few SystemEvents
     * const { count } = await prisma.systemEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SystemEventDeleteManyArgs>(
      args?: SelectSubset<T, SystemEventDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more SystemEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemEvents
     * const systemEvent = await prisma.systemEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SystemEventUpdateManyArgs>(
      args: SelectSubset<T, SystemEventUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more SystemEvents and returns the data updated in the database.
     * @param {SystemEventUpdateManyAndReturnArgs} args - Arguments to update many SystemEvents.
     * @example
     * // Update many SystemEvents
     * const systemEvent = await prisma.systemEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more SystemEvents and only return the `id`
     * const systemEventWithIdOnly = await prisma.systemEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SystemEventUpdateManyAndReturnArgs>(
      args: SelectSubset<T, SystemEventUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one SystemEvent.
     * @param {SystemEventUpsertArgs} args - Arguments to update or create a SystemEvent.
     * @example
     * // Update or create a SystemEvent
     * const systemEvent = await prisma.systemEvent.upsert({
     *   create: {
     *     // ... data to create a SystemEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemEvent we want to update
     *   }
     * })
     */
    upsert<T extends SystemEventUpsertArgs>(
      args: SelectSubset<T, SystemEventUpsertArgs<ExtArgs>>,
    ): Prisma__SystemEventClient<
      $Result.GetResult<
        Prisma.$SystemEventPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of SystemEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventCountArgs} args - Arguments to filter SystemEvents to count.
     * @example
     * // Count the number of SystemEvents
     * const count = await prisma.systemEvent.count({
     *   where: {
     *     // ... the filter for the SystemEvents we want to count
     *   }
     * })
     **/
    count<T extends SystemEventCountArgs>(
      args?: Subset<T, SystemEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemEventCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a SystemEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends SystemEventAggregateArgs>(
      args: Subset<T, SystemEventAggregateArgs>,
    ): Prisma.PrismaPromise<GetSystemEventAggregateType<T>>;

    /**
     * Group by SystemEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends SystemEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemEventGroupByArgs['orderBy'] }
        : { orderBy?: SystemEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, SystemEventGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetSystemEventGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the SystemEvent model
     */
    readonly fields: SystemEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemEventClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the SystemEvent model
   */
  interface SystemEventFieldRefs {
    readonly id: FieldRef<'SystemEvent', 'String'>;
    readonly type: FieldRef<'SystemEvent', 'String'>;
    readonly details: FieldRef<'SystemEvent', 'String'>;
    readonly metadata: FieldRef<'SystemEvent', 'Json'>;
    readonly createdAt: FieldRef<'SystemEvent', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * SystemEvent findUnique
   */
  export type SystemEventFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * Filter, which SystemEvent to fetch.
     */
    where: SystemEventWhereUniqueInput;
  };

  /**
   * SystemEvent findUniqueOrThrow
   */
  export type SystemEventFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * Filter, which SystemEvent to fetch.
     */
    where: SystemEventWhereUniqueInput;
  };

  /**
   * SystemEvent findFirst
   */
  export type SystemEventFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * Filter, which SystemEvent to fetch.
     */
    where?: SystemEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SystemEvents to fetch.
     */
    orderBy?:
      | SystemEventOrderByWithRelationInput
      | SystemEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SystemEvents.
     */
    cursor?: SystemEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SystemEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SystemEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SystemEvents.
     */
    distinct?: SystemEventScalarFieldEnum | SystemEventScalarFieldEnum[];
  };

  /**
   * SystemEvent findFirstOrThrow
   */
  export type SystemEventFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * Filter, which SystemEvent to fetch.
     */
    where?: SystemEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SystemEvents to fetch.
     */
    orderBy?:
      | SystemEventOrderByWithRelationInput
      | SystemEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SystemEvents.
     */
    cursor?: SystemEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SystemEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SystemEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SystemEvents.
     */
    distinct?: SystemEventScalarFieldEnum | SystemEventScalarFieldEnum[];
  };

  /**
   * SystemEvent findMany
   */
  export type SystemEventFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * Filter, which SystemEvents to fetch.
     */
    where?: SystemEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SystemEvents to fetch.
     */
    orderBy?:
      | SystemEventOrderByWithRelationInput
      | SystemEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing SystemEvents.
     */
    cursor?: SystemEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SystemEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SystemEvents.
     */
    skip?: number;
    distinct?: SystemEventScalarFieldEnum | SystemEventScalarFieldEnum[];
  };

  /**
   * SystemEvent create
   */
  export type SystemEventCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * The data needed to create a SystemEvent.
     */
    data: XOR<SystemEventCreateInput, SystemEventUncheckedCreateInput>;
  };

  /**
   * SystemEvent createMany
   */
  export type SystemEventCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many SystemEvents.
     */
    data: SystemEventCreateManyInput | SystemEventCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * SystemEvent createManyAndReturn
   */
  export type SystemEventCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * The data used to create many SystemEvents.
     */
    data: SystemEventCreateManyInput | SystemEventCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * SystemEvent update
   */
  export type SystemEventUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * The data needed to update a SystemEvent.
     */
    data: XOR<SystemEventUpdateInput, SystemEventUncheckedUpdateInput>;
    /**
     * Choose, which SystemEvent to update.
     */
    where: SystemEventWhereUniqueInput;
  };

  /**
   * SystemEvent updateMany
   */
  export type SystemEventUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update SystemEvents.
     */
    data: XOR<
      SystemEventUpdateManyMutationInput,
      SystemEventUncheckedUpdateManyInput
    >;
    /**
     * Filter which SystemEvents to update
     */
    where?: SystemEventWhereInput;
    /**
     * Limit how many SystemEvents to update.
     */
    limit?: number;
  };

  /**
   * SystemEvent updateManyAndReturn
   */
  export type SystemEventUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * The data used to update SystemEvents.
     */
    data: XOR<
      SystemEventUpdateManyMutationInput,
      SystemEventUncheckedUpdateManyInput
    >;
    /**
     * Filter which SystemEvents to update
     */
    where?: SystemEventWhereInput;
    /**
     * Limit how many SystemEvents to update.
     */
    limit?: number;
  };

  /**
   * SystemEvent upsert
   */
  export type SystemEventUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * The filter to search for the SystemEvent to update in case it exists.
     */
    where: SystemEventWhereUniqueInput;
    /**
     * In case the SystemEvent found by the `where` argument doesn't exist, create a new SystemEvent with this data.
     */
    create: XOR<SystemEventCreateInput, SystemEventUncheckedCreateInput>;
    /**
     * In case the SystemEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemEventUpdateInput, SystemEventUncheckedUpdateInput>;
  };

  /**
   * SystemEvent delete
   */
  export type SystemEventDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
    /**
     * Filter which SystemEvent to delete.
     */
    where: SystemEventWhereUniqueInput;
  };

  /**
   * SystemEvent deleteMany
   */
  export type SystemEventDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which SystemEvents to delete
     */
    where?: SystemEventWhereInput;
    /**
     * Limit how many SystemEvents to delete.
     */
    limit?: number;
  };

  /**
   * SystemEvent without action
   */
  export type SystemEventDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SystemEvent
     */
    select?: SystemEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SystemEvent
     */
    omit?: SystemEventOmit<ExtArgs> | null;
  };

  /**
   * Model Client
   */

  export type AggregateClient = {
    _count: ClientCountAggregateOutputType | null;
    _min: ClientMinAggregateOutputType | null;
    _max: ClientMaxAggregateOutputType | null;
  };

  export type ClientMinAggregateOutputType = {
    id: string | null;
    tipoEntidad: $Enums.TipoEntidad | null;
    tipoDocumento: string | null;
    numeroDocumento: string | null;
    nombres: string | null;
    apellidos: string | null;
    razonSocial: string | null;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    usuarioCreacion: string | null;
    usuarioActualizacion: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ClientMaxAggregateOutputType = {
    id: string | null;
    tipoEntidad: $Enums.TipoEntidad | null;
    tipoDocumento: string | null;
    numeroDocumento: string | null;
    nombres: string | null;
    apellidos: string | null;
    razonSocial: string | null;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    usuarioCreacion: string | null;
    usuarioActualizacion: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ClientCountAggregateOutputType = {
    id: number;
    tipoEntidad: number;
    tipoDocumento: number;
    numeroDocumento: number;
    nombres: number;
    apellidos: number;
    razonSocial: number;
    email: number;
    telefono: number;
    direccion: number;
    ciudad: number;
    usuarioCreacion: number;
    usuarioActualizacion: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type ClientMinAggregateInputType = {
    id?: true;
    tipoEntidad?: true;
    tipoDocumento?: true;
    numeroDocumento?: true;
    nombres?: true;
    apellidos?: true;
    razonSocial?: true;
    email?: true;
    telefono?: true;
    direccion?: true;
    ciudad?: true;
    usuarioCreacion?: true;
    usuarioActualizacion?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ClientMaxAggregateInputType = {
    id?: true;
    tipoEntidad?: true;
    tipoDocumento?: true;
    numeroDocumento?: true;
    nombres?: true;
    apellidos?: true;
    razonSocial?: true;
    email?: true;
    telefono?: true;
    direccion?: true;
    ciudad?: true;
    usuarioCreacion?: true;
    usuarioActualizacion?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ClientCountAggregateInputType = {
    id?: true;
    tipoEntidad?: true;
    tipoDocumento?: true;
    numeroDocumento?: true;
    nombres?: true;
    apellidos?: true;
    razonSocial?: true;
    email?: true;
    telefono?: true;
    direccion?: true;
    ciudad?: true;
    usuarioCreacion?: true;
    usuarioActualizacion?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type ClientAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Client to aggregate.
     */
    where?: ClientWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ClientWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Clients.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Clients
     **/
    _count?: true | ClientCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ClientMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ClientMaxAggregateInputType;
  };

  export type GetClientAggregateType<T extends ClientAggregateArgs> = {
    [P in keyof T & keyof AggregateClient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClient[P]>
      : GetScalarType<T[P], AggregateClient[P]>;
  };

  export type ClientGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ClientWhereInput;
    orderBy?:
      | ClientOrderByWithAggregationInput
      | ClientOrderByWithAggregationInput[];
    by: ClientScalarFieldEnum[] | ClientScalarFieldEnum;
    having?: ClientScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientCountAggregateInputType | true;
    _min?: ClientMinAggregateInputType;
    _max?: ClientMaxAggregateInputType;
  };

  export type ClientGroupByOutputType = {
    id: string;
    tipoEntidad: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string | null;
    apellidos: string | null;
    razonSocial: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioCreacion: string | null;
    usuarioActualizacion: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: ClientCountAggregateOutputType | null;
    _min: ClientMinAggregateOutputType | null;
    _max: ClientMaxAggregateOutputType | null;
  };

  type GetClientGroupByPayload<T extends ClientGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ClientGroupByOutputType, T['by']> & {
          [P in keyof T & keyof ClientGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientGroupByOutputType[P]>
            : GetScalarType<T[P], ClientGroupByOutputType[P]>;
        }
      >
    >;

  export type ClientSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tipoEntidad?: boolean;
      tipoDocumento?: boolean;
      numeroDocumento?: boolean;
      nombres?: boolean;
      apellidos?: boolean;
      razonSocial?: boolean;
      email?: boolean;
      telefono?: boolean;
      direccion?: boolean;
      ciudad?: boolean;
      usuarioCreacion?: boolean;
      usuarioActualizacion?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      createdBy?: boolean | Client$createdByArgs<ExtArgs>;
      updatedBy?: boolean | Client$updatedByArgs<ExtArgs>;
    },
    ExtArgs['result']['client']
  >;

  export type ClientSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tipoEntidad?: boolean;
      tipoDocumento?: boolean;
      numeroDocumento?: boolean;
      nombres?: boolean;
      apellidos?: boolean;
      razonSocial?: boolean;
      email?: boolean;
      telefono?: boolean;
      direccion?: boolean;
      ciudad?: boolean;
      usuarioCreacion?: boolean;
      usuarioActualizacion?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      createdBy?: boolean | Client$createdByArgs<ExtArgs>;
      updatedBy?: boolean | Client$updatedByArgs<ExtArgs>;
    },
    ExtArgs['result']['client']
  >;

  export type ClientSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      tipoEntidad?: boolean;
      tipoDocumento?: boolean;
      numeroDocumento?: boolean;
      nombres?: boolean;
      apellidos?: boolean;
      razonSocial?: boolean;
      email?: boolean;
      telefono?: boolean;
      direccion?: boolean;
      ciudad?: boolean;
      usuarioCreacion?: boolean;
      usuarioActualizacion?: boolean;
      isActive?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      createdBy?: boolean | Client$createdByArgs<ExtArgs>;
      updatedBy?: boolean | Client$updatedByArgs<ExtArgs>;
    },
    ExtArgs['result']['client']
  >;

  export type ClientSelectScalar = {
    id?: boolean;
    tipoEntidad?: boolean;
    tipoDocumento?: boolean;
    numeroDocumento?: boolean;
    nombres?: boolean;
    apellidos?: boolean;
    razonSocial?: boolean;
    email?: boolean;
    telefono?: boolean;
    direccion?: boolean;
    ciudad?: boolean;
    usuarioCreacion?: boolean;
    usuarioActualizacion?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type ClientOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'tipoEntidad'
    | 'tipoDocumento'
    | 'numeroDocumento'
    | 'nombres'
    | 'apellidos'
    | 'razonSocial'
    | 'email'
    | 'telefono'
    | 'direccion'
    | 'ciudad'
    | 'usuarioCreacion'
    | 'usuarioActualizacion'
    | 'isActive'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['client']
  >;
  export type ClientInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    createdBy?: boolean | Client$createdByArgs<ExtArgs>;
    updatedBy?: boolean | Client$updatedByArgs<ExtArgs>;
  };
  export type ClientIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    createdBy?: boolean | Client$createdByArgs<ExtArgs>;
    updatedBy?: boolean | Client$updatedByArgs<ExtArgs>;
  };
  export type ClientIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    createdBy?: boolean | Client$createdByArgs<ExtArgs>;
    updatedBy?: boolean | Client$updatedByArgs<ExtArgs>;
  };

  export type $ClientPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Client';
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs> | null;
      updatedBy: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        tipoEntidad: $Enums.TipoEntidad;
        tipoDocumento: string;
        numeroDocumento: string;
        nombres: string | null;
        apellidos: string | null;
        razonSocial: string | null;
        email: string;
        telefono: string;
        direccion: string;
        ciudad: string;
        usuarioCreacion: string | null;
        usuarioActualizacion: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['client']
    >;
    composites: {};
  };

  type ClientGetPayload<
    S extends boolean | null | undefined | ClientDefaultArgs,
  > = $Result.GetResult<Prisma.$ClientPayload, S>;

  type ClientCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<ClientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientCountAggregateInputType | true;
  };

  export interface ClientDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Client'];
      meta: { name: 'Client' };
    };
    /**
     * Find zero or one Client that matches the filter.
     * @param {ClientFindUniqueArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientFindUniqueArgs>(
      args: SelectSubset<T, ClientFindUniqueArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Client that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientFindUniqueOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ClientFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Client that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientFindFirstArgs>(
      args?: SelectSubset<T, ClientFindFirstArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Client that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ClientFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Clients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clients
     * const clients = await prisma.client.findMany()
     *
     * // Get first 10 Clients
     * const clients = await prisma.client.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const clientWithIdOnly = await prisma.client.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ClientFindManyArgs>(
      args?: SelectSubset<T, ClientFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Client.
     * @param {ClientCreateArgs} args - Arguments to create a Client.
     * @example
     * // Create one Client
     * const Client = await prisma.client.create({
     *   data: {
     *     // ... data to create a Client
     *   }
     * })
     *
     */
    create<T extends ClientCreateArgs>(
      args: SelectSubset<T, ClientCreateArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Clients.
     * @param {ClientCreateManyArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ClientCreateManyArgs>(
      args?: SelectSubset<T, ClientCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Clients and returns the data saved in the database.
     * @param {ClientCreateManyAndReturnArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ClientCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ClientCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Client.
     * @param {ClientDeleteArgs} args - Arguments to delete one Client.
     * @example
     * // Delete one Client
     * const Client = await prisma.client.delete({
     *   where: {
     *     // ... filter to delete one Client
     *   }
     * })
     *
     */
    delete<T extends ClientDeleteArgs>(
      args: SelectSubset<T, ClientDeleteArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Client.
     * @param {ClientUpdateArgs} args - Arguments to update one Client.
     * @example
     * // Update one Client
     * const client = await prisma.client.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ClientUpdateArgs>(
      args: SelectSubset<T, ClientUpdateArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Clients.
     * @param {ClientDeleteManyArgs} args - Arguments to filter Clients to delete.
     * @example
     * // Delete a few Clients
     * const { count } = await prisma.client.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ClientDeleteManyArgs>(
      args?: SelectSubset<T, ClientDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ClientUpdateManyArgs>(
      args: SelectSubset<T, ClientUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Clients and returns the data updated in the database.
     * @param {ClientUpdateManyAndReturnArgs} args - Arguments to update many Clients.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ClientUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ClientUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Client.
     * @param {ClientUpsertArgs} args - Arguments to update or create a Client.
     * @example
     * // Update or create a Client
     * const client = await prisma.client.upsert({
     *   create: {
     *     // ... data to create a Client
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Client we want to update
     *   }
     * })
     */
    upsert<T extends ClientUpsertArgs>(
      args: SelectSubset<T, ClientUpsertArgs<ExtArgs>>,
    ): Prisma__ClientClient<
      $Result.GetResult<
        Prisma.$ClientPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientCountArgs} args - Arguments to filter Clients to count.
     * @example
     * // Count the number of Clients
     * const count = await prisma.client.count({
     *   where: {
     *     // ... the filter for the Clients we want to count
     *   }
     * })
     **/
    count<T extends ClientCountArgs>(
      args?: Subset<T, ClientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ClientAggregateArgs>(
      args: Subset<T, ClientAggregateArgs>,
    ): Prisma.PrismaPromise<GetClientAggregateType<T>>;

    /**
     * Group by Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ClientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientGroupByArgs['orderBy'] }
        : { orderBy?: ClientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ClientGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetClientGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Client model
     */
    readonly fields: ClientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Client.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    createdBy<T extends Client$createdByArgs<ExtArgs> = {}>(
      args?: Subset<T, Client$createdByArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    updatedBy<T extends Client$updatedByArgs<ExtArgs> = {}>(
      args?: Subset<T, Client$updatedByArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Client model
   */
  interface ClientFieldRefs {
    readonly id: FieldRef<'Client', 'String'>;
    readonly tipoEntidad: FieldRef<'Client', 'TipoEntidad'>;
    readonly tipoDocumento: FieldRef<'Client', 'String'>;
    readonly numeroDocumento: FieldRef<'Client', 'String'>;
    readonly nombres: FieldRef<'Client', 'String'>;
    readonly apellidos: FieldRef<'Client', 'String'>;
    readonly razonSocial: FieldRef<'Client', 'String'>;
    readonly email: FieldRef<'Client', 'String'>;
    readonly telefono: FieldRef<'Client', 'String'>;
    readonly direccion: FieldRef<'Client', 'String'>;
    readonly ciudad: FieldRef<'Client', 'String'>;
    readonly usuarioCreacion: FieldRef<'Client', 'String'>;
    readonly usuarioActualizacion: FieldRef<'Client', 'String'>;
    readonly isActive: FieldRef<'Client', 'Boolean'>;
    readonly createdAt: FieldRef<'Client', 'DateTime'>;
    readonly updatedAt: FieldRef<'Client', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Client findUnique
   */
  export type ClientFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput;
  };

  /**
   * Client findUniqueOrThrow
   */
  export type ClientFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput;
  };

  /**
   * Client findFirst
   */
  export type ClientFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Clients.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[];
  };

  /**
   * Client findFirstOrThrow
   */
  export type ClientFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Clients.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[];
  };

  /**
   * Client findMany
   */
  export type ClientFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * Filter, which Clients to fetch.
     */
    where?: ClientWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Clients.
     */
    cursor?: ClientWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Clients.
     */
    skip?: number;
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[];
  };

  /**
   * Client create
   */
  export type ClientCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * The data needed to create a Client.
     */
    data: XOR<ClientCreateInput, ClientUncheckedCreateInput>;
  };

  /**
   * Client createMany
   */
  export type ClientCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Client createManyAndReturn
   */
  export type ClientCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Client update
   */
  export type ClientUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * The data needed to update a Client.
     */
    data: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>;
    /**
     * Choose, which Client to update.
     */
    where: ClientWhereUniqueInput;
  };

  /**
   * Client updateMany
   */
  export type ClientUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>;
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput;
    /**
     * Limit how many Clients to update.
     */
    limit?: number;
  };

  /**
   * Client updateManyAndReturn
   */
  export type ClientUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>;
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput;
    /**
     * Limit how many Clients to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Client upsert
   */
  export type ClientUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * The filter to search for the Client to update in case it exists.
     */
    where: ClientWhereUniqueInput;
    /**
     * In case the Client found by the `where` argument doesn't exist, create a new Client with this data.
     */
    create: XOR<ClientCreateInput, ClientUncheckedCreateInput>;
    /**
     * In case the Client was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>;
  };

  /**
   * Client delete
   */
  export type ClientDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
    /**
     * Filter which Client to delete.
     */
    where: ClientWhereUniqueInput;
  };

  /**
   * Client deleteMany
   */
  export type ClientDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Clients to delete
     */
    where?: ClientWhereInput;
    /**
     * Limit how many Clients to delete.
     */
    limit?: number;
  };

  /**
   * Client.createdBy
   */
  export type Client$createdByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    where?: UserWhereInput;
  };

  /**
   * Client.updatedBy
   */
  export type Client$updatedByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    where?: UserWhereInput;
  };

  /**
   * Client without action
   */
  export type ClientDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const UserScalarFieldEnum: {
    id: 'id';
    email: 'email';
    username: 'username';
    password: 'password';
    firstName: 'firstName';
    lastName: 'lastName';
    isActive: 'isActive';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
    lastAccess: 'lastAccess';
    permissions: 'permissions';
  };

  export type UserScalarFieldEnum =
    (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const AuditLogScalarFieldEnum: {
    id: 'id';
    action: 'action';
    userId: 'userId';
    targetId: 'targetId';
    details: 'details';
    ipAddress: 'ipAddress';
    userAgent: 'userAgent';
    createdAt: 'createdAt';
  };

  export type AuditLogScalarFieldEnum =
    (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum];

  export const UserActivityScalarFieldEnum: {
    id: 'id';
    userId: 'userId';
    action: 'action';
    details: 'details';
    ipAddress: 'ipAddress';
    userAgent: 'userAgent';
    createdAt: 'createdAt';
  };

  export type UserActivityScalarFieldEnum =
    (typeof UserActivityScalarFieldEnum)[keyof typeof UserActivityScalarFieldEnum];

  export const SystemEventScalarFieldEnum: {
    id: 'id';
    type: 'type';
    details: 'details';
    metadata: 'metadata';
    createdAt: 'createdAt';
  };

  export type SystemEventScalarFieldEnum =
    (typeof SystemEventScalarFieldEnum)[keyof typeof SystemEventScalarFieldEnum];

  export const ClientScalarFieldEnum: {
    id: 'id';
    tipoEntidad: 'tipoEntidad';
    tipoDocumento: 'tipoDocumento';
    numeroDocumento: 'numeroDocumento';
    nombres: 'nombres';
    apellidos: 'apellidos';
    razonSocial: 'razonSocial';
    email: 'email';
    telefono: 'telefono';
    direccion: 'direccion';
    ciudad: 'ciudad';
    usuarioCreacion: 'usuarioCreacion';
    usuarioActualizacion: 'usuarioActualizacion';
    isActive: 'isActive';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type ClientScalarFieldEnum =
    (typeof ClientScalarFieldEnum)[keyof typeof ClientScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
  };

  export type NullableJsonNullValueInput =
    (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  export const JsonNullValueFilter: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };

  export type JsonNullValueFilter =
    (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String'
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String[]'
  >;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Boolean'
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime'
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Json'
  >;

  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'QueryMode'
  >;

  /**
   * Reference to a field of type 'TipoEntidad'
   */
  export type EnumTipoEntidadFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'TipoEntidad'
  >;

  /**
   * Reference to a field of type 'TipoEntidad[]'
   */
  export type ListEnumTipoEntidadFieldRefInput<$PrismaModel> =
    FieldRefInputType<$PrismaModel, 'TipoEntidad[]'>;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int'
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int[]'
  >;

  /**
   * Deep Input Types
   */

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<'User'> | string;
    email?: StringFilter<'User'> | string;
    username?: StringFilter<'User'> | string;
    password?: StringFilter<'User'> | string;
    firstName?: StringFilter<'User'> | string;
    lastName?: StringFilter<'User'> | string;
    isActive?: BoolFilter<'User'> | boolean;
    createdAt?: DateTimeFilter<'User'> | Date | string;
    updatedAt?: DateTimeFilter<'User'> | Date | string;
    lastAccess?: DateTimeNullableFilter<'User'> | Date | string | null;
    permissions?: StringNullableListFilter<'User'>;
    auditLogs?: AuditLogListRelationFilter;
    userActivities?: UserActivityListRelationFilter;
    clientsCreated?: ClientListRelationFilter;
    clientsUpdated?: ClientListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    password?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    lastAccess?: SortOrderInput | SortOrder;
    permissions?: SortOrder;
    auditLogs?: AuditLogOrderByRelationAggregateInput;
    userActivities?: UserActivityOrderByRelationAggregateInput;
    clientsCreated?: ClientOrderByRelationAggregateInput;
    clientsUpdated?: ClientOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      email?: string;
      username?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      password?: StringFilter<'User'> | string;
      firstName?: StringFilter<'User'> | string;
      lastName?: StringFilter<'User'> | string;
      isActive?: BoolFilter<'User'> | boolean;
      createdAt?: DateTimeFilter<'User'> | Date | string;
      updatedAt?: DateTimeFilter<'User'> | Date | string;
      lastAccess?: DateTimeNullableFilter<'User'> | Date | string | null;
      permissions?: StringNullableListFilter<'User'>;
      auditLogs?: AuditLogListRelationFilter;
      userActivities?: UserActivityListRelationFilter;
      clientsCreated?: ClientListRelationFilter;
      clientsUpdated?: ClientListRelationFilter;
    },
    'id' | 'email' | 'username'
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    password?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    lastAccess?: SortOrderInput | SortOrder;
    permissions?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'User'> | string;
    email?: StringWithAggregatesFilter<'User'> | string;
    username?: StringWithAggregatesFilter<'User'> | string;
    password?: StringWithAggregatesFilter<'User'> | string;
    firstName?: StringWithAggregatesFilter<'User'> | string;
    lastName?: StringWithAggregatesFilter<'User'> | string;
    isActive?: BoolWithAggregatesFilter<'User'> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<'User'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'User'> | Date | string;
    lastAccess?:
      | DateTimeNullableWithAggregatesFilter<'User'>
      | Date
      | string
      | null;
    permissions?: StringNullableListFilter<'User'>;
  };

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[];
    OR?: AuditLogWhereInput[];
    NOT?: AuditLogWhereInput | AuditLogWhereInput[];
    id?: StringFilter<'AuditLog'> | string;
    action?: StringFilter<'AuditLog'> | string;
    userId?: StringNullableFilter<'AuditLog'> | string | null;
    targetId?: StringNullableFilter<'AuditLog'> | string | null;
    details?: StringNullableFilter<'AuditLog'> | string | null;
    ipAddress?: StringNullableFilter<'AuditLog'> | string | null;
    userAgent?: StringNullableFilter<'AuditLog'> | string | null;
    createdAt?: DateTimeFilter<'AuditLog'> | Date | string;
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null;
  };

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder;
    action?: SortOrder;
    userId?: SortOrderInput | SortOrder;
    targetId?: SortOrderInput | SortOrder;
    details?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    userAgent?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: AuditLogWhereInput | AuditLogWhereInput[];
      OR?: AuditLogWhereInput[];
      NOT?: AuditLogWhereInput | AuditLogWhereInput[];
      action?: StringFilter<'AuditLog'> | string;
      userId?: StringNullableFilter<'AuditLog'> | string | null;
      targetId?: StringNullableFilter<'AuditLog'> | string | null;
      details?: StringNullableFilter<'AuditLog'> | string | null;
      ipAddress?: StringNullableFilter<'AuditLog'> | string | null;
      userAgent?: StringNullableFilter<'AuditLog'> | string | null;
      createdAt?: DateTimeFilter<'AuditLog'> | Date | string;
      user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null;
    },
    'id'
  >;

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder;
    action?: SortOrder;
    userId?: SortOrderInput | SortOrder;
    targetId?: SortOrderInput | SortOrder;
    details?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    userAgent?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: AuditLogCountOrderByAggregateInput;
    _max?: AuditLogMaxOrderByAggregateInput;
    _min?: AuditLogMinOrderByAggregateInput;
  };

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?:
      | AuditLogScalarWhereWithAggregatesInput
      | AuditLogScalarWhereWithAggregatesInput[];
    OR?: AuditLogScalarWhereWithAggregatesInput[];
    NOT?:
      | AuditLogScalarWhereWithAggregatesInput
      | AuditLogScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'AuditLog'> | string;
    action?: StringWithAggregatesFilter<'AuditLog'> | string;
    userId?: StringNullableWithAggregatesFilter<'AuditLog'> | string | null;
    targetId?: StringNullableWithAggregatesFilter<'AuditLog'> | string | null;
    details?: StringNullableWithAggregatesFilter<'AuditLog'> | string | null;
    ipAddress?: StringNullableWithAggregatesFilter<'AuditLog'> | string | null;
    userAgent?: StringNullableWithAggregatesFilter<'AuditLog'> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<'AuditLog'> | Date | string;
  };

  export type UserActivityWhereInput = {
    AND?: UserActivityWhereInput | UserActivityWhereInput[];
    OR?: UserActivityWhereInput[];
    NOT?: UserActivityWhereInput | UserActivityWhereInput[];
    id?: StringFilter<'UserActivity'> | string;
    userId?: StringFilter<'UserActivity'> | string;
    action?: StringFilter<'UserActivity'> | string;
    details?: StringNullableFilter<'UserActivity'> | string | null;
    ipAddress?: StringNullableFilter<'UserActivity'> | string | null;
    userAgent?: StringNullableFilter<'UserActivity'> | string | null;
    createdAt?: DateTimeFilter<'UserActivity'> | Date | string;
    user?: XOR<UserScalarRelationFilter, UserWhereInput>;
  };

  export type UserActivityOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    details?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    userAgent?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type UserActivityWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: UserActivityWhereInput | UserActivityWhereInput[];
      OR?: UserActivityWhereInput[];
      NOT?: UserActivityWhereInput | UserActivityWhereInput[];
      userId?: StringFilter<'UserActivity'> | string;
      action?: StringFilter<'UserActivity'> | string;
      details?: StringNullableFilter<'UserActivity'> | string | null;
      ipAddress?: StringNullableFilter<'UserActivity'> | string | null;
      userAgent?: StringNullableFilter<'UserActivity'> | string | null;
      createdAt?: DateTimeFilter<'UserActivity'> | Date | string;
      user?: XOR<UserScalarRelationFilter, UserWhereInput>;
    },
    'id'
  >;

  export type UserActivityOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    details?: SortOrderInput | SortOrder;
    ipAddress?: SortOrderInput | SortOrder;
    userAgent?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: UserActivityCountOrderByAggregateInput;
    _max?: UserActivityMaxOrderByAggregateInput;
    _min?: UserActivityMinOrderByAggregateInput;
  };

  export type UserActivityScalarWhereWithAggregatesInput = {
    AND?:
      | UserActivityScalarWhereWithAggregatesInput
      | UserActivityScalarWhereWithAggregatesInput[];
    OR?: UserActivityScalarWhereWithAggregatesInput[];
    NOT?:
      | UserActivityScalarWhereWithAggregatesInput
      | UserActivityScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'UserActivity'> | string;
    userId?: StringWithAggregatesFilter<'UserActivity'> | string;
    action?: StringWithAggregatesFilter<'UserActivity'> | string;
    details?:
      | StringNullableWithAggregatesFilter<'UserActivity'>
      | string
      | null;
    ipAddress?:
      | StringNullableWithAggregatesFilter<'UserActivity'>
      | string
      | null;
    userAgent?:
      | StringNullableWithAggregatesFilter<'UserActivity'>
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'UserActivity'> | Date | string;
  };

  export type SystemEventWhereInput = {
    AND?: SystemEventWhereInput | SystemEventWhereInput[];
    OR?: SystemEventWhereInput[];
    NOT?: SystemEventWhereInput | SystemEventWhereInput[];
    id?: StringFilter<'SystemEvent'> | string;
    type?: StringFilter<'SystemEvent'> | string;
    details?: StringNullableFilter<'SystemEvent'> | string | null;
    metadata?: JsonNullableFilter<'SystemEvent'>;
    createdAt?: DateTimeFilter<'SystemEvent'> | Date | string;
  };

  export type SystemEventOrderByWithRelationInput = {
    id?: SortOrder;
    type?: SortOrder;
    details?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
  };

  export type SystemEventWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: SystemEventWhereInput | SystemEventWhereInput[];
      OR?: SystemEventWhereInput[];
      NOT?: SystemEventWhereInput | SystemEventWhereInput[];
      type?: StringFilter<'SystemEvent'> | string;
      details?: StringNullableFilter<'SystemEvent'> | string | null;
      metadata?: JsonNullableFilter<'SystemEvent'>;
      createdAt?: DateTimeFilter<'SystemEvent'> | Date | string;
    },
    'id'
  >;

  export type SystemEventOrderByWithAggregationInput = {
    id?: SortOrder;
    type?: SortOrder;
    details?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: SystemEventCountOrderByAggregateInput;
    _max?: SystemEventMaxOrderByAggregateInput;
    _min?: SystemEventMinOrderByAggregateInput;
  };

  export type SystemEventScalarWhereWithAggregatesInput = {
    AND?:
      | SystemEventScalarWhereWithAggregatesInput
      | SystemEventScalarWhereWithAggregatesInput[];
    OR?: SystemEventScalarWhereWithAggregatesInput[];
    NOT?:
      | SystemEventScalarWhereWithAggregatesInput
      | SystemEventScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'SystemEvent'> | string;
    type?: StringWithAggregatesFilter<'SystemEvent'> | string;
    details?: StringNullableWithAggregatesFilter<'SystemEvent'> | string | null;
    metadata?: JsonNullableWithAggregatesFilter<'SystemEvent'>;
    createdAt?: DateTimeWithAggregatesFilter<'SystemEvent'> | Date | string;
  };

  export type ClientWhereInput = {
    AND?: ClientWhereInput | ClientWhereInput[];
    OR?: ClientWhereInput[];
    NOT?: ClientWhereInput | ClientWhereInput[];
    id?: StringFilter<'Client'> | string;
    tipoEntidad?: EnumTipoEntidadFilter<'Client'> | $Enums.TipoEntidad;
    tipoDocumento?: StringFilter<'Client'> | string;
    numeroDocumento?: StringFilter<'Client'> | string;
    nombres?: StringNullableFilter<'Client'> | string | null;
    apellidos?: StringNullableFilter<'Client'> | string | null;
    razonSocial?: StringNullableFilter<'Client'> | string | null;
    email?: StringFilter<'Client'> | string;
    telefono?: StringFilter<'Client'> | string;
    direccion?: StringFilter<'Client'> | string;
    ciudad?: StringFilter<'Client'> | string;
    usuarioCreacion?: StringNullableFilter<'Client'> | string | null;
    usuarioActualizacion?: StringNullableFilter<'Client'> | string | null;
    isActive?: BoolFilter<'Client'> | boolean;
    createdAt?: DateTimeFilter<'Client'> | Date | string;
    updatedAt?: DateTimeFilter<'Client'> | Date | string;
    createdBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null;
    updatedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null;
  };

  export type ClientOrderByWithRelationInput = {
    id?: SortOrder;
    tipoEntidad?: SortOrder;
    tipoDocumento?: SortOrder;
    numeroDocumento?: SortOrder;
    nombres?: SortOrderInput | SortOrder;
    apellidos?: SortOrderInput | SortOrder;
    razonSocial?: SortOrderInput | SortOrder;
    email?: SortOrder;
    telefono?: SortOrder;
    direccion?: SortOrder;
    ciudad?: SortOrder;
    usuarioCreacion?: SortOrderInput | SortOrder;
    usuarioActualizacion?: SortOrderInput | SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    createdBy?: UserOrderByWithRelationInput;
    updatedBy?: UserOrderByWithRelationInput;
  };

  export type ClientWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      numeroDocumento?: string;
      email?: string;
      AND?: ClientWhereInput | ClientWhereInput[];
      OR?: ClientWhereInput[];
      NOT?: ClientWhereInput | ClientWhereInput[];
      tipoEntidad?: EnumTipoEntidadFilter<'Client'> | $Enums.TipoEntidad;
      tipoDocumento?: StringFilter<'Client'> | string;
      nombres?: StringNullableFilter<'Client'> | string | null;
      apellidos?: StringNullableFilter<'Client'> | string | null;
      razonSocial?: StringNullableFilter<'Client'> | string | null;
      telefono?: StringFilter<'Client'> | string;
      direccion?: StringFilter<'Client'> | string;
      ciudad?: StringFilter<'Client'> | string;
      usuarioCreacion?: StringNullableFilter<'Client'> | string | null;
      usuarioActualizacion?: StringNullableFilter<'Client'> | string | null;
      isActive?: BoolFilter<'Client'> | boolean;
      createdAt?: DateTimeFilter<'Client'> | Date | string;
      updatedAt?: DateTimeFilter<'Client'> | Date | string;
      createdBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null;
      updatedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null;
    },
    'id' | 'numeroDocumento' | 'email'
  >;

  export type ClientOrderByWithAggregationInput = {
    id?: SortOrder;
    tipoEntidad?: SortOrder;
    tipoDocumento?: SortOrder;
    numeroDocumento?: SortOrder;
    nombres?: SortOrderInput | SortOrder;
    apellidos?: SortOrderInput | SortOrder;
    razonSocial?: SortOrderInput | SortOrder;
    email?: SortOrder;
    telefono?: SortOrder;
    direccion?: SortOrder;
    ciudad?: SortOrder;
    usuarioCreacion?: SortOrderInput | SortOrder;
    usuarioActualizacion?: SortOrderInput | SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: ClientCountOrderByAggregateInput;
    _max?: ClientMaxOrderByAggregateInput;
    _min?: ClientMinOrderByAggregateInput;
  };

  export type ClientScalarWhereWithAggregatesInput = {
    AND?:
      | ClientScalarWhereWithAggregatesInput
      | ClientScalarWhereWithAggregatesInput[];
    OR?: ClientScalarWhereWithAggregatesInput[];
    NOT?:
      | ClientScalarWhereWithAggregatesInput
      | ClientScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Client'> | string;
    tipoEntidad?:
      | EnumTipoEntidadWithAggregatesFilter<'Client'>
      | $Enums.TipoEntidad;
    tipoDocumento?: StringWithAggregatesFilter<'Client'> | string;
    numeroDocumento?: StringWithAggregatesFilter<'Client'> | string;
    nombres?: StringNullableWithAggregatesFilter<'Client'> | string | null;
    apellidos?: StringNullableWithAggregatesFilter<'Client'> | string | null;
    razonSocial?: StringNullableWithAggregatesFilter<'Client'> | string | null;
    email?: StringWithAggregatesFilter<'Client'> | string;
    telefono?: StringWithAggregatesFilter<'Client'> | string;
    direccion?: StringWithAggregatesFilter<'Client'> | string;
    ciudad?: StringWithAggregatesFilter<'Client'> | string;
    usuarioCreacion?:
      | StringNullableWithAggregatesFilter<'Client'>
      | string
      | null;
    usuarioActualizacion?:
      | StringNullableWithAggregatesFilter<'Client'>
      | string
      | null;
    isActive?: BoolWithAggregatesFilter<'Client'> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<'Client'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Client'> | Date | string;
  };

  export type UserCreateInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    userActivities?: UserActivityCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientCreateNestedManyWithoutCreatedByInput;
    clientsUpdated?: ClientCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserUncheckedCreateInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    userActivities?: UserActivityUncheckedCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientUncheckedCreateNestedManyWithoutCreatedByInput;
    clientsUpdated?: ClientUncheckedCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    userActivities?: UserActivityUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUpdateManyWithoutCreatedByNestedInput;
    clientsUpdated?: ClientUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    userActivities?: UserActivityUncheckedUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUncheckedUpdateManyWithoutCreatedByNestedInput;
    clientsUpdated?: ClientUncheckedUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserCreateManyInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
  };

  export type AuditLogCreateInput = {
    id?: string;
    action: string;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
    user?: UserCreateNestedOneWithoutAuditLogsInput;
  };

  export type AuditLogUncheckedCreateInput = {
    id?: string;
    action: string;
    userId?: string | null;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneWithoutAuditLogsNestedInput;
  };

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogCreateManyInput = {
    id?: string;
    action: string;
    userId?: string | null;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    userId?: NullableStringFieldUpdateOperationsInput | string | null;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserActivityCreateInput = {
    id?: string;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutUserActivitiesInput;
  };

  export type UserActivityUncheckedCreateInput = {
    id?: string;
    userId: string;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type UserActivityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutUserActivitiesNestedInput;
  };

  export type UserActivityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserActivityCreateManyInput = {
    id?: string;
    userId: string;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type UserActivityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserActivityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SystemEventCreateInput = {
    id?: string;
    type: string;
    details?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
  };

  export type SystemEventUncheckedCreateInput = {
    id?: string;
    type: string;
    details?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
  };

  export type SystemEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SystemEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SystemEventCreateManyInput = {
    id?: string;
    type: string;
    details?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
  };

  export type SystemEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SystemEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientCreateInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: UserCreateNestedOneWithoutClientsCreatedInput;
    updatedBy?: UserCreateNestedOneWithoutClientsUpdatedInput;
  };

  export type ClientUncheckedCreateInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioCreacion?: string | null;
    usuarioActualizacion?: string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ClientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdBy?: UserUpdateOneWithoutClientsCreatedNestedInput;
    updatedBy?: UserUpdateOneWithoutClientsUpdatedNestedInput;
  };

  export type ClientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    usuarioCreacion?: NullableStringFieldUpdateOperationsInput | string | null;
    usuarioActualizacion?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientCreateManyInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioCreacion?: string | null;
    usuarioActualizacion?: string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ClientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    usuarioCreacion?: NullableStringFieldUpdateOperationsInput | string | null;
    usuarioActualizacion?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
  };

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput;
    some?: AuditLogWhereInput;
    none?: AuditLogWhereInput;
  };

  export type UserActivityListRelationFilter = {
    every?: UserActivityWhereInput;
    some?: UserActivityWhereInput;
    none?: UserActivityWhereInput;
  };

  export type ClientListRelationFilter = {
    every?: ClientWhereInput;
    some?: ClientWhereInput;
    none?: ClientWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserActivityOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type ClientOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    password?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    lastAccess?: SortOrder;
    permissions?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    password?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    lastAccess?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    email?: SortOrder;
    username?: SortOrder;
    password?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    lastAccess?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?:
      | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
      | Date
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null;
    isNot?: UserWhereInput | null;
  };

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder;
    action?: SortOrder;
    userId?: SortOrder;
    targetId?: SortOrder;
    details?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder;
    action?: SortOrder;
    userId?: SortOrder;
    targetId?: SortOrder;
    details?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder;
    action?: SortOrder;
    userId?: SortOrder;
    targetId?: SortOrder;
    details?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type UserScalarRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type UserActivityCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    details?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type UserActivityMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    details?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };

  export type UserActivityMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    action?: SortOrder;
    details?: SortOrder;
    ipAddress?: SortOrder;
    userAgent?: SortOrder;
    createdAt?: SortOrder;
  };
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<
        Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>
      >;

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
  };

  export type SystemEventCountOrderByAggregateInput = {
    id?: SortOrder;
    type?: SortOrder;
    details?: SortOrder;
    metadata?: SortOrder;
    createdAt?: SortOrder;
  };

  export type SystemEventMaxOrderByAggregateInput = {
    id?: SortOrder;
    type?: SortOrder;
    details?: SortOrder;
    createdAt?: SortOrder;
  };

  export type SystemEventMinOrderByAggregateInput = {
    id?: SortOrder;
    type?: SortOrder;
    details?: SortOrder;
    createdAt?: SortOrder;
  };
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<
            keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
            'path'
          >
        >,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<
        Omit<
          Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
          'path'
        >
      >;

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedJsonNullableFilter<$PrismaModel>;
    _max?: NestedJsonNullableFilter<$PrismaModel>;
  };

  export type EnumTipoEntidadFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
    notIn?:
      | $Enums.TipoEntidad[]
      | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
    not?: NestedEnumTipoEntidadFilter<$PrismaModel> | $Enums.TipoEntidad;
  };

  export type ClientCountOrderByAggregateInput = {
    id?: SortOrder;
    tipoEntidad?: SortOrder;
    tipoDocumento?: SortOrder;
    numeroDocumento?: SortOrder;
    nombres?: SortOrder;
    apellidos?: SortOrder;
    razonSocial?: SortOrder;
    email?: SortOrder;
    telefono?: SortOrder;
    direccion?: SortOrder;
    ciudad?: SortOrder;
    usuarioCreacion?: SortOrder;
    usuarioActualizacion?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ClientMaxOrderByAggregateInput = {
    id?: SortOrder;
    tipoEntidad?: SortOrder;
    tipoDocumento?: SortOrder;
    numeroDocumento?: SortOrder;
    nombres?: SortOrder;
    apellidos?: SortOrder;
    razonSocial?: SortOrder;
    email?: SortOrder;
    telefono?: SortOrder;
    direccion?: SortOrder;
    ciudad?: SortOrder;
    usuarioCreacion?: SortOrder;
    usuarioActualizacion?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ClientMinOrderByAggregateInput = {
    id?: SortOrder;
    tipoEntidad?: SortOrder;
    tipoDocumento?: SortOrder;
    numeroDocumento?: SortOrder;
    nombres?: SortOrder;
    apellidos?: SortOrder;
    razonSocial?: SortOrder;
    email?: SortOrder;
    telefono?: SortOrder;
    direccion?: SortOrder;
    ciudad?: SortOrder;
    usuarioCreacion?: SortOrder;
    usuarioActualizacion?: SortOrder;
    isActive?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type EnumTipoEntidadWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
    notIn?:
      | $Enums.TipoEntidad[]
      | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
    not?:
      | NestedEnumTipoEntidadWithAggregatesFilter<$PrismaModel>
      | $Enums.TipoEntidad;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumTipoEntidadFilter<$PrismaModel>;
    _max?: NestedEnumTipoEntidadFilter<$PrismaModel>;
  };

  export type UserCreatepermissionsInput = {
    set: string[];
  };

  export type AuditLogCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<
          AuditLogCreateWithoutUserInput,
          AuditLogUncheckedCreateWithoutUserInput
        >
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | AuditLogCreateOrConnectWithoutUserInput
      | AuditLogCreateOrConnectWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
  };

  export type UserActivityCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<
          UserActivityCreateWithoutUserInput,
          UserActivityUncheckedCreateWithoutUserInput
        >
      | UserActivityCreateWithoutUserInput[]
      | UserActivityUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserActivityCreateOrConnectWithoutUserInput
      | UserActivityCreateOrConnectWithoutUserInput[];
    createMany?: UserActivityCreateManyUserInputEnvelope;
    connect?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
  };

  export type ClientCreateNestedManyWithoutCreatedByInput = {
    create?:
      | XOR<
          ClientCreateWithoutCreatedByInput,
          ClientUncheckedCreateWithoutCreatedByInput
        >
      | ClientCreateWithoutCreatedByInput[]
      | ClientUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutCreatedByInput
      | ClientCreateOrConnectWithoutCreatedByInput[];
    createMany?: ClientCreateManyCreatedByInputEnvelope;
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
  };

  export type ClientCreateNestedManyWithoutUpdatedByInput = {
    create?:
      | XOR<
          ClientCreateWithoutUpdatedByInput,
          ClientUncheckedCreateWithoutUpdatedByInput
        >
      | ClientCreateWithoutUpdatedByInput[]
      | ClientUncheckedCreateWithoutUpdatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutUpdatedByInput
      | ClientCreateOrConnectWithoutUpdatedByInput[];
    createMany?: ClientCreateManyUpdatedByInputEnvelope;
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
  };

  export type AuditLogUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<
          AuditLogCreateWithoutUserInput,
          AuditLogUncheckedCreateWithoutUserInput
        >
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | AuditLogCreateOrConnectWithoutUserInput
      | AuditLogCreateOrConnectWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
  };

  export type UserActivityUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<
          UserActivityCreateWithoutUserInput,
          UserActivityUncheckedCreateWithoutUserInput
        >
      | UserActivityCreateWithoutUserInput[]
      | UserActivityUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserActivityCreateOrConnectWithoutUserInput
      | UserActivityCreateOrConnectWithoutUserInput[];
    createMany?: UserActivityCreateManyUserInputEnvelope;
    connect?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
  };

  export type ClientUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?:
      | XOR<
          ClientCreateWithoutCreatedByInput,
          ClientUncheckedCreateWithoutCreatedByInput
        >
      | ClientCreateWithoutCreatedByInput[]
      | ClientUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutCreatedByInput
      | ClientCreateOrConnectWithoutCreatedByInput[];
    createMany?: ClientCreateManyCreatedByInputEnvelope;
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
  };

  export type ClientUncheckedCreateNestedManyWithoutUpdatedByInput = {
    create?:
      | XOR<
          ClientCreateWithoutUpdatedByInput,
          ClientUncheckedCreateWithoutUpdatedByInput
        >
      | ClientCreateWithoutUpdatedByInput[]
      | ClientUncheckedCreateWithoutUpdatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutUpdatedByInput
      | ClientCreateOrConnectWithoutUpdatedByInput[];
    createMany?: ClientCreateManyUpdatedByInputEnvelope;
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type UserUpdatepermissionsInput = {
    set?: string[];
    push?: string | string[];
  };

  export type AuditLogUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<
          AuditLogCreateWithoutUserInput,
          AuditLogUncheckedCreateWithoutUserInput
        >
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | AuditLogCreateOrConnectWithoutUserInput
      | AuditLogCreateOrConnectWithoutUserInput[];
    upsert?:
      | AuditLogUpsertWithWhereUniqueWithoutUserInput
      | AuditLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    update?:
      | AuditLogUpdateWithWhereUniqueWithoutUserInput
      | AuditLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | AuditLogUpdateManyWithWhereWithoutUserInput
      | AuditLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
  };

  export type UserActivityUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<
          UserActivityCreateWithoutUserInput,
          UserActivityUncheckedCreateWithoutUserInput
        >
      | UserActivityCreateWithoutUserInput[]
      | UserActivityUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserActivityCreateOrConnectWithoutUserInput
      | UserActivityCreateOrConnectWithoutUserInput[];
    upsert?:
      | UserActivityUpsertWithWhereUniqueWithoutUserInput
      | UserActivityUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: UserActivityCreateManyUserInputEnvelope;
    set?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    disconnect?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    delete?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    connect?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    update?:
      | UserActivityUpdateWithWhereUniqueWithoutUserInput
      | UserActivityUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | UserActivityUpdateManyWithWhereWithoutUserInput
      | UserActivityUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: UserActivityScalarWhereInput | UserActivityScalarWhereInput[];
  };

  export type ClientUpdateManyWithoutCreatedByNestedInput = {
    create?:
      | XOR<
          ClientCreateWithoutCreatedByInput,
          ClientUncheckedCreateWithoutCreatedByInput
        >
      | ClientCreateWithoutCreatedByInput[]
      | ClientUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutCreatedByInput
      | ClientCreateOrConnectWithoutCreatedByInput[];
    upsert?:
      | ClientUpsertWithWhereUniqueWithoutCreatedByInput
      | ClientUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: ClientCreateManyCreatedByInputEnvelope;
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    update?:
      | ClientUpdateWithWhereUniqueWithoutCreatedByInput
      | ClientUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?:
      | ClientUpdateManyWithWhereWithoutCreatedByInput
      | ClientUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[];
  };

  export type ClientUpdateManyWithoutUpdatedByNestedInput = {
    create?:
      | XOR<
          ClientCreateWithoutUpdatedByInput,
          ClientUncheckedCreateWithoutUpdatedByInput
        >
      | ClientCreateWithoutUpdatedByInput[]
      | ClientUncheckedCreateWithoutUpdatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutUpdatedByInput
      | ClientCreateOrConnectWithoutUpdatedByInput[];
    upsert?:
      | ClientUpsertWithWhereUniqueWithoutUpdatedByInput
      | ClientUpsertWithWhereUniqueWithoutUpdatedByInput[];
    createMany?: ClientCreateManyUpdatedByInputEnvelope;
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    update?:
      | ClientUpdateWithWhereUniqueWithoutUpdatedByInput
      | ClientUpdateWithWhereUniqueWithoutUpdatedByInput[];
    updateMany?:
      | ClientUpdateManyWithWhereWithoutUpdatedByInput
      | ClientUpdateManyWithWhereWithoutUpdatedByInput[];
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[];
  };

  export type AuditLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<
          AuditLogCreateWithoutUserInput,
          AuditLogUncheckedCreateWithoutUserInput
        >
      | AuditLogCreateWithoutUserInput[]
      | AuditLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | AuditLogCreateOrConnectWithoutUserInput
      | AuditLogCreateOrConnectWithoutUserInput[];
    upsert?:
      | AuditLogUpsertWithWhereUniqueWithoutUserInput
      | AuditLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: AuditLogCreateManyUserInputEnvelope;
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[];
    update?:
      | AuditLogUpdateWithWhereUniqueWithoutUserInput
      | AuditLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | AuditLogUpdateManyWithWhereWithoutUserInput
      | AuditLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
  };

  export type UserActivityUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<
          UserActivityCreateWithoutUserInput,
          UserActivityUncheckedCreateWithoutUserInput
        >
      | UserActivityCreateWithoutUserInput[]
      | UserActivityUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | UserActivityCreateOrConnectWithoutUserInput
      | UserActivityCreateOrConnectWithoutUserInput[];
    upsert?:
      | UserActivityUpsertWithWhereUniqueWithoutUserInput
      | UserActivityUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: UserActivityCreateManyUserInputEnvelope;
    set?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    disconnect?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    delete?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    connect?: UserActivityWhereUniqueInput | UserActivityWhereUniqueInput[];
    update?:
      | UserActivityUpdateWithWhereUniqueWithoutUserInput
      | UserActivityUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | UserActivityUpdateManyWithWhereWithoutUserInput
      | UserActivityUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: UserActivityScalarWhereInput | UserActivityScalarWhereInput[];
  };

  export type ClientUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?:
      | XOR<
          ClientCreateWithoutCreatedByInput,
          ClientUncheckedCreateWithoutCreatedByInput
        >
      | ClientCreateWithoutCreatedByInput[]
      | ClientUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutCreatedByInput
      | ClientCreateOrConnectWithoutCreatedByInput[];
    upsert?:
      | ClientUpsertWithWhereUniqueWithoutCreatedByInput
      | ClientUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: ClientCreateManyCreatedByInputEnvelope;
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    update?:
      | ClientUpdateWithWhereUniqueWithoutCreatedByInput
      | ClientUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?:
      | ClientUpdateManyWithWhereWithoutCreatedByInput
      | ClientUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[];
  };

  export type ClientUncheckedUpdateManyWithoutUpdatedByNestedInput = {
    create?:
      | XOR<
          ClientCreateWithoutUpdatedByInput,
          ClientUncheckedCreateWithoutUpdatedByInput
        >
      | ClientCreateWithoutUpdatedByInput[]
      | ClientUncheckedCreateWithoutUpdatedByInput[];
    connectOrCreate?:
      | ClientCreateOrConnectWithoutUpdatedByInput
      | ClientCreateOrConnectWithoutUpdatedByInput[];
    upsert?:
      | ClientUpsertWithWhereUniqueWithoutUpdatedByInput
      | ClientUpsertWithWhereUniqueWithoutUpdatedByInput[];
    createMany?: ClientCreateManyUpdatedByInputEnvelope;
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[];
    update?:
      | ClientUpdateWithWhereUniqueWithoutUpdatedByInput
      | ClientUpdateWithWhereUniqueWithoutUpdatedByInput[];
    updateMany?:
      | ClientUpdateManyWithWhereWithoutUpdatedByInput
      | ClientUpdateManyWithWhereWithoutUpdatedByInput[];
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[];
  };

  export type UserCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<
      UserCreateWithoutAuditLogsInput,
      UserUncheckedCreateWithoutAuditLogsInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput;
    connect?: UserWhereUniqueInput;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type UserUpdateOneWithoutAuditLogsNestedInput = {
    create?: XOR<
      UserCreateWithoutAuditLogsInput,
      UserUncheckedCreateWithoutAuditLogsInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput;
    upsert?: UserUpsertWithoutAuditLogsInput;
    disconnect?: UserWhereInput | boolean;
    delete?: UserWhereInput | boolean;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutAuditLogsInput,
        UserUpdateWithoutAuditLogsInput
      >,
      UserUncheckedUpdateWithoutAuditLogsInput
    >;
  };

  export type UserCreateNestedOneWithoutUserActivitiesInput = {
    create?: XOR<
      UserCreateWithoutUserActivitiesInput,
      UserUncheckedCreateWithoutUserActivitiesInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutUserActivitiesInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserUpdateOneRequiredWithoutUserActivitiesNestedInput = {
    create?: XOR<
      UserCreateWithoutUserActivitiesInput,
      UserUncheckedCreateWithoutUserActivitiesInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutUserActivitiesInput;
    upsert?: UserUpsertWithoutUserActivitiesInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutUserActivitiesInput,
        UserUpdateWithoutUserActivitiesInput
      >,
      UserUncheckedUpdateWithoutUserActivitiesInput
    >;
  };

  export type UserCreateNestedOneWithoutClientsCreatedInput = {
    create?: XOR<
      UserCreateWithoutClientsCreatedInput,
      UserUncheckedCreateWithoutClientsCreatedInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutClientsCreatedInput;
    connect?: UserWhereUniqueInput;
  };

  export type UserCreateNestedOneWithoutClientsUpdatedInput = {
    create?: XOR<
      UserCreateWithoutClientsUpdatedInput,
      UserUncheckedCreateWithoutClientsUpdatedInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutClientsUpdatedInput;
    connect?: UserWhereUniqueInput;
  };

  export type EnumTipoEntidadFieldUpdateOperationsInput = {
    set?: $Enums.TipoEntidad;
  };

  export type UserUpdateOneWithoutClientsCreatedNestedInput = {
    create?: XOR<
      UserCreateWithoutClientsCreatedInput,
      UserUncheckedCreateWithoutClientsCreatedInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutClientsCreatedInput;
    upsert?: UserUpsertWithoutClientsCreatedInput;
    disconnect?: UserWhereInput | boolean;
    delete?: UserWhereInput | boolean;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutClientsCreatedInput,
        UserUpdateWithoutClientsCreatedInput
      >,
      UserUncheckedUpdateWithoutClientsCreatedInput
    >;
  };

  export type UserUpdateOneWithoutClientsUpdatedNestedInput = {
    create?: XOR<
      UserCreateWithoutClientsUpdatedInput,
      UserUncheckedCreateWithoutClientsUpdatedInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutClientsUpdatedInput;
    upsert?: UserUpsertWithoutClientsUpdatedInput;
    disconnect?: UserWhereInput | boolean;
    delete?: UserWhereInput | boolean;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutClientsUpdatedInput,
        UserUpdateWithoutClientsUpdatedInput
      >,
      UserUncheckedUpdateWithoutClientsUpdatedInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
      in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
      notIn?:
        | Date[]
        | string[]
        | ListDateTimeFieldRefInput<$PrismaModel>
        | null;
      lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      not?:
        | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
        | Date
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _min?: NestedDateTimeNullableFilter<$PrismaModel>;
      _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonNullableFilterBase<$PrismaModel>>,
          Exclude<
            keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>,
            'path'
          >
        >,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<
        Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>
      >;

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
  };

  export type NestedEnumTipoEntidadFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoEntidad[] | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
    notIn?:
      | $Enums.TipoEntidad[]
      | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
    not?: NestedEnumTipoEntidadFilter<$PrismaModel> | $Enums.TipoEntidad;
  };

  export type NestedEnumTipoEntidadWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: $Enums.TipoEntidad | EnumTipoEntidadFieldRefInput<$PrismaModel>;
      in?:
        | $Enums.TipoEntidad[]
        | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
      notIn?:
        | $Enums.TipoEntidad[]
        | ListEnumTipoEntidadFieldRefInput<$PrismaModel>;
      not?:
        | NestedEnumTipoEntidadWithAggregatesFilter<$PrismaModel>
        | $Enums.TipoEntidad;
      _count?: NestedIntFilter<$PrismaModel>;
      _min?: NestedEnumTipoEntidadFilter<$PrismaModel>;
      _max?: NestedEnumTipoEntidadFilter<$PrismaModel>;
    };

  export type AuditLogCreateWithoutUserInput = {
    id?: string;
    action: string;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogUncheckedCreateWithoutUserInput = {
    id?: string;
    action: string;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type AuditLogCreateOrConnectWithoutUserInput = {
    where: AuditLogWhereUniqueInput;
    create: XOR<
      AuditLogCreateWithoutUserInput,
      AuditLogUncheckedCreateWithoutUserInput
    >;
  };

  export type AuditLogCreateManyUserInputEnvelope = {
    data: AuditLogCreateManyUserInput | AuditLogCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type UserActivityCreateWithoutUserInput = {
    id?: string;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type UserActivityUncheckedCreateWithoutUserInput = {
    id?: string;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type UserActivityCreateOrConnectWithoutUserInput = {
    where: UserActivityWhereUniqueInput;
    create: XOR<
      UserActivityCreateWithoutUserInput,
      UserActivityUncheckedCreateWithoutUserInput
    >;
  };

  export type UserActivityCreateManyUserInputEnvelope = {
    data: UserActivityCreateManyUserInput | UserActivityCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type ClientCreateWithoutCreatedByInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    updatedBy?: UserCreateNestedOneWithoutClientsUpdatedInput;
  };

  export type ClientUncheckedCreateWithoutCreatedByInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioActualizacion?: string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ClientCreateOrConnectWithoutCreatedByInput = {
    where: ClientWhereUniqueInput;
    create: XOR<
      ClientCreateWithoutCreatedByInput,
      ClientUncheckedCreateWithoutCreatedByInput
    >;
  };

  export type ClientCreateManyCreatedByInputEnvelope = {
    data: ClientCreateManyCreatedByInput | ClientCreateManyCreatedByInput[];
    skipDuplicates?: boolean;
  };

  export type ClientCreateWithoutUpdatedByInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: UserCreateNestedOneWithoutClientsCreatedInput;
  };

  export type ClientUncheckedCreateWithoutUpdatedByInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioCreacion?: string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ClientCreateOrConnectWithoutUpdatedByInput = {
    where: ClientWhereUniqueInput;
    create: XOR<
      ClientCreateWithoutUpdatedByInput,
      ClientUncheckedCreateWithoutUpdatedByInput
    >;
  };

  export type ClientCreateManyUpdatedByInputEnvelope = {
    data: ClientCreateManyUpdatedByInput | ClientCreateManyUpdatedByInput[];
    skipDuplicates?: boolean;
  };

  export type AuditLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput;
    update: XOR<
      AuditLogUpdateWithoutUserInput,
      AuditLogUncheckedUpdateWithoutUserInput
    >;
    create: XOR<
      AuditLogCreateWithoutUserInput,
      AuditLogUncheckedCreateWithoutUserInput
    >;
  };

  export type AuditLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput;
    data: XOR<
      AuditLogUpdateWithoutUserInput,
      AuditLogUncheckedUpdateWithoutUserInput
    >;
  };

  export type AuditLogUpdateManyWithWhereWithoutUserInput = {
    where: AuditLogScalarWhereInput;
    data: XOR<
      AuditLogUpdateManyMutationInput,
      AuditLogUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
    OR?: AuditLogScalarWhereInput[];
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[];
    id?: StringFilter<'AuditLog'> | string;
    action?: StringFilter<'AuditLog'> | string;
    userId?: StringNullableFilter<'AuditLog'> | string | null;
    targetId?: StringNullableFilter<'AuditLog'> | string | null;
    details?: StringNullableFilter<'AuditLog'> | string | null;
    ipAddress?: StringNullableFilter<'AuditLog'> | string | null;
    userAgent?: StringNullableFilter<'AuditLog'> | string | null;
    createdAt?: DateTimeFilter<'AuditLog'> | Date | string;
  };

  export type UserActivityUpsertWithWhereUniqueWithoutUserInput = {
    where: UserActivityWhereUniqueInput;
    update: XOR<
      UserActivityUpdateWithoutUserInput,
      UserActivityUncheckedUpdateWithoutUserInput
    >;
    create: XOR<
      UserActivityCreateWithoutUserInput,
      UserActivityUncheckedCreateWithoutUserInput
    >;
  };

  export type UserActivityUpdateWithWhereUniqueWithoutUserInput = {
    where: UserActivityWhereUniqueInput;
    data: XOR<
      UserActivityUpdateWithoutUserInput,
      UserActivityUncheckedUpdateWithoutUserInput
    >;
  };

  export type UserActivityUpdateManyWithWhereWithoutUserInput = {
    where: UserActivityScalarWhereInput;
    data: XOR<
      UserActivityUpdateManyMutationInput,
      UserActivityUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type UserActivityScalarWhereInput = {
    AND?: UserActivityScalarWhereInput | UserActivityScalarWhereInput[];
    OR?: UserActivityScalarWhereInput[];
    NOT?: UserActivityScalarWhereInput | UserActivityScalarWhereInput[];
    id?: StringFilter<'UserActivity'> | string;
    userId?: StringFilter<'UserActivity'> | string;
    action?: StringFilter<'UserActivity'> | string;
    details?: StringNullableFilter<'UserActivity'> | string | null;
    ipAddress?: StringNullableFilter<'UserActivity'> | string | null;
    userAgent?: StringNullableFilter<'UserActivity'> | string | null;
    createdAt?: DateTimeFilter<'UserActivity'> | Date | string;
  };

  export type ClientUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: ClientWhereUniqueInput;
    update: XOR<
      ClientUpdateWithoutCreatedByInput,
      ClientUncheckedUpdateWithoutCreatedByInput
    >;
    create: XOR<
      ClientCreateWithoutCreatedByInput,
      ClientUncheckedCreateWithoutCreatedByInput
    >;
  };

  export type ClientUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: ClientWhereUniqueInput;
    data: XOR<
      ClientUpdateWithoutCreatedByInput,
      ClientUncheckedUpdateWithoutCreatedByInput
    >;
  };

  export type ClientUpdateManyWithWhereWithoutCreatedByInput = {
    where: ClientScalarWhereInput;
    data: XOR<
      ClientUpdateManyMutationInput,
      ClientUncheckedUpdateManyWithoutCreatedByInput
    >;
  };

  export type ClientScalarWhereInput = {
    AND?: ClientScalarWhereInput | ClientScalarWhereInput[];
    OR?: ClientScalarWhereInput[];
    NOT?: ClientScalarWhereInput | ClientScalarWhereInput[];
    id?: StringFilter<'Client'> | string;
    tipoEntidad?: EnumTipoEntidadFilter<'Client'> | $Enums.TipoEntidad;
    tipoDocumento?: StringFilter<'Client'> | string;
    numeroDocumento?: StringFilter<'Client'> | string;
    nombres?: StringNullableFilter<'Client'> | string | null;
    apellidos?: StringNullableFilter<'Client'> | string | null;
    razonSocial?: StringNullableFilter<'Client'> | string | null;
    email?: StringFilter<'Client'> | string;
    telefono?: StringFilter<'Client'> | string;
    direccion?: StringFilter<'Client'> | string;
    ciudad?: StringFilter<'Client'> | string;
    usuarioCreacion?: StringNullableFilter<'Client'> | string | null;
    usuarioActualizacion?: StringNullableFilter<'Client'> | string | null;
    isActive?: BoolFilter<'Client'> | boolean;
    createdAt?: DateTimeFilter<'Client'> | Date | string;
    updatedAt?: DateTimeFilter<'Client'> | Date | string;
  };

  export type ClientUpsertWithWhereUniqueWithoutUpdatedByInput = {
    where: ClientWhereUniqueInput;
    update: XOR<
      ClientUpdateWithoutUpdatedByInput,
      ClientUncheckedUpdateWithoutUpdatedByInput
    >;
    create: XOR<
      ClientCreateWithoutUpdatedByInput,
      ClientUncheckedCreateWithoutUpdatedByInput
    >;
  };

  export type ClientUpdateWithWhereUniqueWithoutUpdatedByInput = {
    where: ClientWhereUniqueInput;
    data: XOR<
      ClientUpdateWithoutUpdatedByInput,
      ClientUncheckedUpdateWithoutUpdatedByInput
    >;
  };

  export type ClientUpdateManyWithWhereWithoutUpdatedByInput = {
    where: ClientScalarWhereInput;
    data: XOR<
      ClientUpdateManyMutationInput,
      ClientUncheckedUpdateManyWithoutUpdatedByInput
    >;
  };

  export type UserCreateWithoutAuditLogsInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    userActivities?: UserActivityCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientCreateNestedManyWithoutCreatedByInput;
    clientsUpdated?: ClientCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserUncheckedCreateWithoutAuditLogsInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    userActivities?: UserActivityUncheckedCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientUncheckedCreateNestedManyWithoutCreatedByInput;
    clientsUpdated?: ClientUncheckedCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserCreateOrConnectWithoutAuditLogsInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutAuditLogsInput,
      UserUncheckedCreateWithoutAuditLogsInput
    >;
  };

  export type UserUpsertWithoutAuditLogsInput = {
    update: XOR<
      UserUpdateWithoutAuditLogsInput,
      UserUncheckedUpdateWithoutAuditLogsInput
    >;
    create: XOR<
      UserCreateWithoutAuditLogsInput,
      UserUncheckedCreateWithoutAuditLogsInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutAuditLogsInput,
      UserUncheckedUpdateWithoutAuditLogsInput
    >;
  };

  export type UserUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    userActivities?: UserActivityUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUpdateManyWithoutCreatedByNestedInput;
    clientsUpdated?: ClientUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    userActivities?: UserActivityUncheckedUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUncheckedUpdateManyWithoutCreatedByNestedInput;
    clientsUpdated?: ClientUncheckedUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserCreateWithoutUserActivitiesInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientCreateNestedManyWithoutCreatedByInput;
    clientsUpdated?: ClientCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserUncheckedCreateWithoutUserActivitiesInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientUncheckedCreateNestedManyWithoutCreatedByInput;
    clientsUpdated?: ClientUncheckedCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserCreateOrConnectWithoutUserActivitiesInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutUserActivitiesInput,
      UserUncheckedCreateWithoutUserActivitiesInput
    >;
  };

  export type UserUpsertWithoutUserActivitiesInput = {
    update: XOR<
      UserUpdateWithoutUserActivitiesInput,
      UserUncheckedUpdateWithoutUserActivitiesInput
    >;
    create: XOR<
      UserCreateWithoutUserActivitiesInput,
      UserUncheckedCreateWithoutUserActivitiesInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutUserActivitiesInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutUserActivitiesInput,
      UserUncheckedUpdateWithoutUserActivitiesInput
    >;
  };

  export type UserUpdateWithoutUserActivitiesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUpdateManyWithoutCreatedByNestedInput;
    clientsUpdated?: ClientUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserUncheckedUpdateWithoutUserActivitiesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUncheckedUpdateManyWithoutCreatedByNestedInput;
    clientsUpdated?: ClientUncheckedUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserCreateWithoutClientsCreatedInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    userActivities?: UserActivityCreateNestedManyWithoutUserInput;
    clientsUpdated?: ClientCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserUncheckedCreateWithoutClientsCreatedInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    userActivities?: UserActivityUncheckedCreateNestedManyWithoutUserInput;
    clientsUpdated?: ClientUncheckedCreateNestedManyWithoutUpdatedByInput;
  };

  export type UserCreateOrConnectWithoutClientsCreatedInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutClientsCreatedInput,
      UserUncheckedCreateWithoutClientsCreatedInput
    >;
  };

  export type UserCreateWithoutClientsUpdatedInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput;
    userActivities?: UserActivityCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientCreateNestedManyWithoutCreatedByInput;
  };

  export type UserUncheckedCreateWithoutClientsUpdatedInput = {
    id?: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lastAccess?: Date | string | null;
    permissions?: UserCreatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput;
    userActivities?: UserActivityUncheckedCreateNestedManyWithoutUserInput;
    clientsCreated?: ClientUncheckedCreateNestedManyWithoutCreatedByInput;
  };

  export type UserCreateOrConnectWithoutClientsUpdatedInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutClientsUpdatedInput,
      UserUncheckedCreateWithoutClientsUpdatedInput
    >;
  };

  export type UserUpsertWithoutClientsCreatedInput = {
    update: XOR<
      UserUpdateWithoutClientsCreatedInput,
      UserUncheckedUpdateWithoutClientsCreatedInput
    >;
    create: XOR<
      UserCreateWithoutClientsCreatedInput,
      UserUncheckedCreateWithoutClientsCreatedInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutClientsCreatedInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutClientsCreatedInput,
      UserUncheckedUpdateWithoutClientsCreatedInput
    >;
  };

  export type UserUpdateWithoutClientsCreatedInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    userActivities?: UserActivityUpdateManyWithoutUserNestedInput;
    clientsUpdated?: ClientUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserUncheckedUpdateWithoutClientsCreatedInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    userActivities?: UserActivityUncheckedUpdateManyWithoutUserNestedInput;
    clientsUpdated?: ClientUncheckedUpdateManyWithoutUpdatedByNestedInput;
  };

  export type UserUpsertWithoutClientsUpdatedInput = {
    update: XOR<
      UserUpdateWithoutClientsUpdatedInput,
      UserUncheckedUpdateWithoutClientsUpdatedInput
    >;
    create: XOR<
      UserCreateWithoutClientsUpdatedInput,
      UserUncheckedCreateWithoutClientsUpdatedInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutClientsUpdatedInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutClientsUpdatedInput,
      UserUncheckedUpdateWithoutClientsUpdatedInput
    >;
  };

  export type UserUpdateWithoutClientsUpdatedInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput;
    userActivities?: UserActivityUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUpdateManyWithoutCreatedByNestedInput;
  };

  export type UserUncheckedUpdateWithoutClientsUpdatedInput = {
    id?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    lastAccess?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    permissions?: UserUpdatepermissionsInput | string[];
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput;
    userActivities?: UserActivityUncheckedUpdateManyWithoutUserNestedInput;
    clientsCreated?: ClientUncheckedUpdateManyWithoutCreatedByNestedInput;
  };

  export type AuditLogCreateManyUserInput = {
    id?: string;
    action: string;
    targetId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type UserActivityCreateManyUserInput = {
    id?: string;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string;
  };

  export type ClientCreateManyCreatedByInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioActualizacion?: string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ClientCreateManyUpdatedByInput = {
    id?: string;
    tipoEntidad?: $Enums.TipoEntidad;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    usuarioCreacion?: string | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AuditLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AuditLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    targetId?: NullableStringFieldUpdateOperationsInput | string | null;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserActivityUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserActivityUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserActivityUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    action?: StringFieldUpdateOperationsInput | string;
    details?: NullableStringFieldUpdateOperationsInput | string | null;
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedBy?: UserUpdateOneWithoutClientsUpdatedNestedInput;
  };

  export type ClientUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    usuarioActualizacion?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    usuarioActualizacion?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientUpdateWithoutUpdatedByInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdBy?: UserUpdateOneWithoutClientsCreatedNestedInput;
  };

  export type ClientUncheckedUpdateWithoutUpdatedByInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    usuarioCreacion?: NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ClientUncheckedUpdateManyWithoutUpdatedByInput = {
    id?: StringFieldUpdateOperationsInput | string;
    tipoEntidad?:
      | EnumTipoEntidadFieldUpdateOperationsInput
      | $Enums.TipoEntidad;
    tipoDocumento?: StringFieldUpdateOperationsInput | string;
    numeroDocumento?: StringFieldUpdateOperationsInput | string;
    nombres?: NullableStringFieldUpdateOperationsInput | string | null;
    apellidos?: NullableStringFieldUpdateOperationsInput | string | null;
    razonSocial?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: StringFieldUpdateOperationsInput | string;
    telefono?: StringFieldUpdateOperationsInput | string;
    direccion?: StringFieldUpdateOperationsInput | string;
    ciudad?: StringFieldUpdateOperationsInput | string;
    usuarioCreacion?: NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
