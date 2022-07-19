import {
  CosmosClient,
  DatabaseRequest,
  ContainerRequest,
  SqlQuerySpec,
  SqlParameter,
} from '@azure/cosmos';
import { Injectable } from '@nestjs/common';
import { myConfig } from './config';
import { IName } from './names.entity';

@Injectable()
export class AppService {
  private client: CosmosClient;
  private options = {
    endpoint: myConfig.endpoint,
    key: myConfig.key,
    userAgentSuffix: myConfig.userAgentSuffix,
  };
  constructor() {
    this.client = new CosmosClient(this.options);
  }

  getHello(): string {
    return 'Hello World!';
  }

  async prepareDatabase() {
    await this.createDatabase();
    await this.readDatabase();
    await this.createContainer();
    await this.readContainer();
  }

  /**
   * Query the container using SQL
   */
  async queryContainer(params: IName): Promise<string[]> {
    const querySpec: SqlQuerySpec = this.getSqlQuery(params);
    const { resources } = await this.client
      .database(myConfig.database.id)
      .container(myConfig.container.id)
      .items.query<IName>(querySpec)
      .fetchAll();
    this.logQueryResults(resources);
    return this.getUniqueNames(resources);
  }

  private getUniqueNames(resources: IName[]): string[] {
    const allNames = [...new Set(resources.map((item) => item.data).flat())];
    console.log(
      `\tResult ${allNames.slice(0, 3)},[...] with ${allNames.length} items\n`,
    );
    return allNames;
  }

  /**
   * Create the database if it does not exist
   */
  private async createDatabase() {
    const databaseRequest: DatabaseRequest = {
      id: myConfig.database.id,
    };
    const { database } = await this.client.databases.createIfNotExists(
      databaseRequest,
    );
    console.log(`Created database:\n${database.id}\n`);
  }

  /**
   * Read the database definition
   */
  private async readDatabase() {
    const { resource: databaseDefinition } = await this.client
      .database(myConfig.database.id)
      .read();
    console.log(`Reading database:\n${databaseDefinition?.id}\n`);
  }

  /**
   * Create the container if it does not exist
   */
  private async createContainer() {
    const containerRequest: ContainerRequest = {
      id: myConfig.container.id,
      partitionKey: myConfig.container.partitionKey,
    };
    const { container } = await this.client
      .database(myConfig.database.id)
      .containers.createIfNotExists(containerRequest);
    console.log(`Created container:\n${container.id}\n`);
  }

  /**
   * Read the container definition
   */
  private async readContainer() {
    const { resource: containerDefinition } = await this.client
      .database(myConfig.database.id)
      .container(myConfig.container.id)
      .read();
    console.log(`Reading container:\n${containerDefinition?.id}\n`);
  }

  private logQueryResults(resources: IName[]) {
    console.log(`Querying container:\n${myConfig.container.id}`);
    for (const queryResult of resources) {
      console.log(
        `\tQuery returned ${queryResult.data.slice(0, 3)},[...] with ${
          queryResult.data.length
        } items\n`,
      );
    }
  }

  private getSqlQuery(params: IName): SqlQuerySpec {
    const parameters: SqlParameter[] = [
      { name: '@isLastName', value: params.isLastName ?? false },
      { name: '@isFemale', value: params.isFemale ?? false },
      { name: '@isMale', value: params.isMale ?? false },
    ];

    let query = 'SELECT * FROM c WHERE c.isLastName = @isLastName';
    if (params.isFemale) {
      query += ' AND c.isFemale = @isFemale';
    }
    if (params.isMale) {
      query += ' AND c.isMale = @isMale';
    }
    const querySpec: SqlQuerySpec = {
      query,
      parameters,
    };
    return querySpec;
  }
}
