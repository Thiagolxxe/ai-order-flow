
/**
 * Base Repository class for MongoDB access
 */
class BaseRepository {
  constructor(db, collectionName) {
    this.collection = db.collection(collectionName);
    this.collectionName = collectionName;
  }

  /**
   * Find all documents with pagination
   */
  async findAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { _id: -1 },
      projection = {}
    } = options;

    const skip = (page - 1) * limit;
    
    try {
      const [documents, totalCount] = await Promise.all([
        this.collection.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .project(projection)
          .toArray(),
        this.collection.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        data: documents,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error(`Error in ${this.collectionName}.findAll:`, error);
      throw error;
    }
  }

  /**
   * Find a document by ID
   */
  async findById(id) {
    try {
      const { ObjectId } = require('mongodb');
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error(`Error in ${this.collectionName}.findById:`, error);
      throw error;
    }
  }

  /**
   * Find a single document
   */
  async findOne(query) {
    try {
      return await this.collection.findOne(query);
    } catch (error) {
      console.error(`Error in ${this.collectionName}.findOne:`, error);
      throw error;
    }
  }

  /**
   * Insert a new document
   */
  async create(data) {
    try {
      const result = await this.collection.insertOne({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return result;
    } catch (error) {
      console.error(`Error in ${this.collectionName}.create:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async update(id, data) {
    try {
      const { ObjectId } = require('mongodb');
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...data,
            updated_at: new Date()
          }
        }
      );
      
      return result;
    } catch (error) {
      console.error(`Error in ${this.collectionName}.update:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(id) {
    try {
      const { ObjectId } = require('mongodb');
      return await this.collection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error(`Error in ${this.collectionName}.delete:`, error);
      throw error;
    }
  }
}

module.exports = BaseRepository;
