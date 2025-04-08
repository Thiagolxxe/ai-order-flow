
const BaseRepository = require('./baseRepository');

class VideoRepository extends BaseRepository {
  constructor(db) {
    super(db, 'videos');
  }

  /**
   * Find trending videos
   */
  async findTrending(limit = 10) {
    try {
      return await this.collection
        .find({ status: 'active' })
        .sort({ views: -1, likes: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error in VideoRepository.findTrending:', error);
      throw error;
    }
  }

  /**
   * Find videos by restaurant ID
   */
  async findByRestaurantId(restaurantId, options = {}) {
    try {
      const query = { restaurante_id: restaurantId, status: 'active' };
      return await this.findAll(query, options);
    } catch (error) {
      console.error('Error in VideoRepository.findByRestaurantId:', error);
      throw error;
    }
  }

  /**
   * Increment video views
   */
  async incrementViews(id) {
    try {
      const { ObjectId } = require('mongodb');
      return await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 } }
      );
    } catch (error) {
      console.error('Error in VideoRepository.incrementViews:', error);
      throw error;
    }
  }

  /**
   * Toggle like on a video
   */
  async toggleLike(id, userId, isLiking = true) {
    try {
      const { ObjectId } = require('mongodb');
      const updateOperation = isLiking
        ? {
            $addToSet: { liked_by: userId },
            $inc: { likes: 1 }
          }
        : {
            $pull: { liked_by: userId },
            $inc: { likes: -1 }
          };

      return await this.collection.updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
    } catch (error) {
      console.error('Error in VideoRepository.toggleLike:', error);
      throw error;
    }
  }
}

module.exports = VideoRepository;
