
const BaseRepository = require('./baseRepository');

class RestaurantRepository extends BaseRepository {
  constructor(db) {
    super(db, 'restaurants');
  }

  /**
   * Find restaurants by location
   */
  async findNearby(lat, lng, maxDistance = 10000, options = {}) {
    try {
      // Add geospatial query if we have location data in the DB
      // This is a simplified example - actual implementation would depend on your schema
      const query = {};
      
      if (lat && lng) {
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        };
      }
      
      return await this.findAll(query, options);
    } catch (error) {
      console.error('Error in RestaurantRepository.findNearby:', error);
      throw error;
    }
  }

  /**
   * Find restaurants by cuisine type
   */
  async findByCuisine(cuisineType, options = {}) {
    try {
      const query = { tipo_cozinha: cuisineType };
      return await this.findAll(query, options);
    } catch (error) {
      console.error('Error in RestaurantRepository.findByCuisine:', error);
      throw error;
    }
  }

  /**
   * Find featured restaurants
   */
  async findFeatured(options = {}) {
    try {
      const query = { featured: true };
      return await this.findAll(query, options);
    } catch (error) {
      console.error('Error in RestaurantRepository.findFeatured:', error);
      throw error;
    }
  }

  /**
   * Search restaurants
   */
  async search(term, options = {}) {
    try {
      const query = {
        $or: [
          { nome: { $regex: term, $options: 'i' } },
          { tipo_cozinha: { $regex: term, $options: 'i' } },
          { descricao: { $regex: term, $options: 'i' } }
        ]
      };
      
      return await this.findAll(query, options);
    } catch (error) {
      console.error('Error in RestaurantRepository.search:', error);
      throw error;
    }
  }
}

module.exports = RestaurantRepository;
