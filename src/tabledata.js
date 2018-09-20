const tables = [];

const articleTable = {
  name: 'Article',
  columns: {
    author: 'VARCHAR(256) NOT NULL,',
    authorWebsite: 'VARCHAR(2083),',
    title: 'VARCHAR(256) NOT NULL,',
    content: 'TEXT NOT NULL,',
    headerImageSrc: 'VARCHAR(2083),',
    creationDate: 'TIMESTAMP NOT NULL,',
    lastEditDate: 'TIMESTAMP NOT NULL,',
    isDeleted: 'BOOLEAN NOT NULL,',
    id: 'CHAR(12) NOT NULL,',
    'CONSTRAINT Article_pk': 'PRIMARY KEY (id)',
  },
};

tables.push(articleTable);

module.exports = { tables };
