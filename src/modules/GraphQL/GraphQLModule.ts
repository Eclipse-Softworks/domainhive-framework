import { EventEmitter } from 'events';
import { graphqlHTTP } from 'express-graphql';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLFieldResolver
} from 'graphql';
import { RequestHandler } from 'express';

export interface GraphQLConfig {
  graphiql?: boolean;
  pretty?: boolean;
  schemaConfig?: {
    query?: GraphQLFieldConfigMap<any, any>;
    mutation?: GraphQLFieldConfigMap<any, any>;
    subscription?: GraphQLFieldConfigMap<any, any>;
  };
}

export interface TypeDefinition {
  name: string;
  fields: GraphQLFieldConfigMap<any, any>;
  description?: string;
}

export interface ResolverMap {
  Query?: Record<string, GraphQLFieldResolver<any, any>>;
  Mutation?: Record<string, GraphQLFieldResolver<any, any>>;
  [key: string]: Record<string, GraphQLFieldResolver<any, any>> | undefined;
}

export class GraphQLModule extends EventEmitter {
  private config: Required<GraphQLConfig>;
  private schema: GraphQLSchema | null = null;
  private queryFields: GraphQLFieldConfigMap<any, any> = {};
  private mutationFields: GraphQLFieldConfigMap<any, any> = {};
  private types: Map<string, GraphQLObjectType> = new Map();

  constructor(config: GraphQLConfig = {}) {
    super();
    this.config = {
      graphiql: config.graphiql !== false,
      pretty: config.pretty !== false,
      schemaConfig: config.schemaConfig || {}
    };

    if (this.config.schemaConfig.query) {
      this.queryFields = { ...this.config.schemaConfig.query };
    }

    if (this.config.schemaConfig.mutation) {
      this.mutationFields = { ...this.config.schemaConfig.mutation };
    }
  }

  addQuery(name: string, config: any): void {
    this.queryFields[name] = config;
    this.schema = null;
    this.emit('queryAdded', { name, config });
  }

  addQueries(queries: Record<string, any>): void {
    Object.entries(queries).forEach(([name, config]) => {
      this.addQuery(name, config);
    });
  }

  addMutation(name: string, config: any): void {
    this.mutationFields[name] = config;
    this.schema = null;
    this.emit('mutationAdded', { name, config });
  }

  addMutations(mutations: Record<string, any>): void {
    Object.entries(mutations).forEach(([name, config]) => {
      this.addMutation(name, config);
    });
  }

  addType(typeDef: TypeDefinition): GraphQLObjectType {
    const type = new GraphQLObjectType({
      name: typeDef.name,
      description: typeDef.description,
      fields: typeDef.fields
    });
    this.types.set(typeDef.name, type);
    this.emit('typeAdded', { name: typeDef.name, type });
    return type;
  }

  getType(name: string): GraphQLObjectType | undefined {
    return this.types.get(name);
  }

  buildSchema(): GraphQLSchema {
    if (this.schema) {
      return this.schema;
    }

    const queryType = new GraphQLObjectType({
      name: 'Query',
      fields: Object.keys(this.queryFields).length > 0
        ? this.queryFields
        : {
            hello: {
              type: GraphQLString,
              resolve: () => 'Hello from DomainHive GraphQL!'
            }
          }
    });

    const mutationType = Object.keys(this.mutationFields).length > 0
      ? new GraphQLObjectType({
          name: 'Mutation',
          fields: this.mutationFields
        })
      : undefined;

    this.schema = new GraphQLSchema({
      query: queryType,
      mutation: mutationType
    });

    this.emit('schemaBuilt', this.schema);
    return this.schema;
  }

  getMiddleware(): RequestHandler {
    const schema = this.buildSchema();
    
    return graphqlHTTP({
      schema,
      graphiql: this.config.graphiql,
      pretty: this.config.pretty
    }) as RequestHandler;
  }

  getSchema(): GraphQLSchema | null {
    return this.schema;
  }

  static get types() {
    return {
      String: GraphQLString,
      Int: GraphQLInt,
      Boolean: GraphQLBoolean,
      List: GraphQLList,
      NonNull: GraphQLNonNull
    };
  }

  static createObjectType(name: string, fields: GraphQLFieldConfigMap<any, any>, description?: string): GraphQLObjectType {
    return new GraphQLObjectType({
      name,
      description,
      fields
    });
  }

  static createInputType(name: string, fields: any, description?: string): GraphQLInputObjectType {
    return new GraphQLInputObjectType({
      name,
      description,
      fields
    });
  }
}
