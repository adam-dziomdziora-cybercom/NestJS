export const myConfig = {
  endpoint: 'https://mywebapscosmosdb.documents.azure.com:443/',
  key: 'mzXdiR2Wa6SkgF7zFesvpib2qv0g4eSWGSz75cVd5swUF4AvYPTPw9sa6Up2kUuTrKA5tSrVYrrw5dMyR9vZgQ==',
  database: {
    id: 'Documents',
  },

  container: {
    id: 'Names',
    partitionKey: '/id',
  },
  userAgentSuffix: 'NestJS',
};
