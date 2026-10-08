import type { RoadmapNodeInfo } from "./cyber-security";

export const databasesNodes: RoadmapNodeInfo[] = [
  {
    id: "relational-sql-basics",
    label: "Relational Model & SQL Basics",
    description: "Tables, rows, columns, keys and constraints, then the everyday SQL verbs: SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY and LIMIT. You also meet NULL, the value that quietly breaks beginners' queries.",
    status: "required",
    resources: {
      course: { title: "CS50's Introduction to Databases with SQL", url: "https://cs50.harvard.edu/sql/", provider: "Harvard CS50", tags: ["Free", "Recommended"] },
      docs: { title: "SQLite: SQL As Understood By SQLite", url: "https://www.sqlite.org/lang.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "data-modeling-normalization",
    label: "Data Modeling & Normalization",
    description: "Turn a real-world problem into entities, relationships and keys, then remove redundancy with the normal forms (1NF to 3NF). You learn to spot update, insert and delete anomalies and to decide when denormalizing on purpose is justified.",
    status: "required",
    resources: {
      book: { title: "Database Design – 2nd Edition", url: "https://opentextbc.ca/dbdesign01/", provider: "Adrienne Watt, BCcampus", tags: ["Free"] },
      docs: { title: "PostgreSQL Tutorial: Foreign Keys", url: "https://www.postgresql.org/docs/current/tutorial-fk.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "joins-aggregation",
    label: "Joins, Aggregation & Subqueries",
    description: "Combine tables with INNER and LEFT JOINs, summarize with GROUP BY, HAVING and aggregate functions, and nest queries with subqueries and CTEs. Includes the classic traps: COUNT(*) versus COUNT(column), and NOT IN with NULLs.",
    status: "required",
    resources: {
      course: { title: "SQLBolt: Interactive SQL Lessons", url: "https://sqlbolt.com/", provider: "SQLBolt", tags: ["Free", "Hands-on"] },
      docs: { title: "PostgreSQL Tutorial: Joins Between Tables", url: "https://www.postgresql.org/docs/current/tutorial-join.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "indexes-performance",
    label: "Indexes & Query Performance",
    description: "How B-tree indexes turn full-table scans into fast lookups, why composite index column order matters, and how to read a query plan with EXPLAIN. You also learn the cost of indexes on writes and why some queries cannot use them.",
    status: "required",
    resources: {
      book: { title: "Use The Index, Luke", url: "https://use-the-index-luke.com/", provider: "Markus Winand", tags: ["Free", "Recommended"] },
      docs: { title: "SQLite Query Planner", url: "https://www.sqlite.org/queryplanner.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "transactions-acid",
    label: "Transactions, ACID & Concurrency",
    description: "Group several statements into one all-or-nothing unit with BEGIN, COMMIT and ROLLBACK, and understand atomicity, consistency, isolation and durability. Covers isolation levels, the anomalies they prevent, locking, deadlocks and optimistic concurrency control.",
    status: "required",
    resources: {
      book: { title: "Designing Data-Intensive Applications", url: "https://dataintensive.net/", provider: "Martin Kleppmann", tags: ["Recommended"] },
      docs: { title: "PostgreSQL: Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "nosql-models",
    label: "NoSQL: Document, Key-Value, Graph",
    description: "The main non-relational families (document, key-value, wide-column and graph stores), what each is good at, and the trade-offs against SQL. Learn embedding versus referencing in documents and why access patterns drive NoSQL schema design.",
    status: "important",
    resources: {
      docs: { title: "MongoDB Manual: Data Modeling", url: "https://www.mongodb.com/docs/manual/data-modeling/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "backup-replication",
    label: "Backup, Replication & High Availability",
    description: "Logical and physical backups, point-in-time recovery, and why a backup you have never restored is only a hope. Then replication (primary and replicas), failover, replication lag, and the RPO and RTO targets that guide the design.",
    status: "important",
    resources: {
      docs: { title: "PostgreSQL: Backup and Restore", url: "https://www.postgresql.org/docs/current/backup.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "db-security",
    label: "Database Security",
    description: "Prevent SQL injection with parameterized queries, apply least-privilege roles, protect credentials, encrypt data in transit and at rest, and keep audit trails. Security here is mostly about limiting what a compromised application account can do.",
    status: "important",
    resources: {
      docs: { title: "OWASP SQL Injection Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "data-warehousing",
    label: "Warehousing & Analytics Basics",
    description: "How analytical (OLAP) systems differ from transactional (OLTP) ones: star schemas, fact and dimension tables, columnar storage and ETL or ELT pipelines. A first look at window functions and analytical queries over large history.",
    status: "optional",
    resources: {
      docs: { title: "SQLite Window Functions", url: "https://www.sqlite.org/windowfunctions.html", tags: ["Free", "Official"] },
    },
  },
];
