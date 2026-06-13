import db from "../config/db";

/**
 * Generic base model class providing reusable CRUD query methods.
 * Designed database-agnostically to work on both PostgreSQL and MySQL.
 */
export class BaseModel<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find a record by its unique ID.
   */
  async findById(id: string): Promise<T | undefined> {
    return db(this.tableName).where({ id }).first() as Promise<T | undefined>;
  }

  /**
   * Find a single record matching specific criteria.
   */
  async findOne(filter: Partial<T> | any): Promise<T | undefined> {
    return db(this.tableName).where(filter).first() as Promise<T | undefined>;
  }

  /**
   * Fetch all records in the table.
   */
  async findAll(): Promise<T[]> {
    return db(this.tableName) as Promise<T[]>;
  }

  /**
   * Find multiple records matching specific criteria.
   */
  async findWhere(filter: Partial<T> | any): Promise<T[]> {
    return db(this.tableName).where(filter) as Promise<T[]>;
  }

  /**
   * Create and insert a new record.
   * Returns the inserted object directly (database-agnostic, works with UUIDs).
   */
  async create(data: any): Promise<T> {
    await db(this.tableName).insert(data);
    return data as T;
  }

  /**
   * Update a record by ID.
   */
  async update(id: string, data: Partial<T> | any): Promise<number> {
    return db(this.tableName).where({ id }).update(data);
  }

  /**
   * Delete a record by ID.
   */
  async delete(id: string): Promise<number> {
    return db(this.tableName).where({ id }).del();
  }
}
