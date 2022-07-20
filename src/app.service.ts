import {
  CosmosClient,
  DatabaseRequest,
  ContainerRequest,
  SqlQuerySpec,
  SqlParameter,
  CosmosClientOptions,
} from '@azure/cosmos';
import { Injectable } from '@nestjs/common';
import { myConfig } from './config';
import { IName } from './names.entity';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { AppServiceBase } from './app.service.base';
import * as env from 'env-var';

@Injectable()
export class AppService extends AppServiceBase {
  private readonly azureCredential = new DefaultAzureCredential();
  private readonly keyVaultName = env
    .get('KEY_VAULT_NAME')
    .required()
    .asString();
  private readonly keyvaultUrl =
    'https://' + this.keyVaultName + '.vault.azure.net';
  private readonly keyVaultClient = new SecretClient(
    this.keyvaultUrl,
    this.azureCredential,
  );
  private cosmosClient: CosmosClient;

  async createCosmosClient() {
    const endpoint = await this.keyVaultClient.getSecret('cosmosdb-endpoint');
    const key = await this.keyVaultClient.getSecret('cosmosdb-key');
    const options: CosmosClientOptions = {
      endpoint: endpoint.value,
      key: key.value,
      userAgentSuffix: myConfig.userAgentSuffix,
    };
    this.cosmosClient = new CosmosClient(options);
  }

  getHello(): string {
    return 'Hello World!';
  }

  async prepareDatabase() {
    if (!this.cosmosClient) {
      await this.createCosmosClient();
    }
    await this.createDatabase();
    await this.readDatabase();
    await this.createContainer();
    await this.readContainer();
  }

  disposeDbConnection() {
    this.cosmosClient.dispose();
  }

  /**
   * Query the container using SQL
   */
  async queryContainer(params: IName): Promise<string[]> {
    const querySpec: SqlQuerySpec = this.getSqlQuery(params);
    const { resources } = await this.cosmosClient
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
    const { database } = await this.cosmosClient.databases.createIfNotExists(
      databaseRequest,
    );
    console.log(`Created database:\n${database.id}\n`);
  }

  /**
   * Read the database definition
   */
  private async readDatabase() {
    const { resource: databaseDefinition } = await this.cosmosClient
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
    const { container } = await this.cosmosClient
      .database(myConfig.database.id)
      .containers.createIfNotExists(containerRequest);
    console.log(`Created container:\n${container.id}\n`);
  }

  /**
   * Read the container definition
   */
  private async readContainer() {
    const { resource: containerDefinition } = await this.cosmosClient
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
