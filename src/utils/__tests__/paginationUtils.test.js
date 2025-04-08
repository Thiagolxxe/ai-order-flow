
import { createPaginationParams, createPaginationLinks } from '../paginationUtils';

describe('paginationUtils', () => {
  describe('createPaginationParams', () => {
    it('should create default pagination params', () => {
      const params = createPaginationParams();
      
      expect(params).toEqual({
        page: 1,
        limit: 10
      });
    });
    
    it('should include sort and order when provided', () => {
      const params = createPaginationParams(2, 20, 'name', 'asc');
      
      expect(params).toEqual({
        page: 2,
        limit: 20,
        sort: 'name',
        order: 'asc'
      });
    });
  });
  
  describe('createPaginationLinks', () => {
    it('should create pagination links for a single page', () => {
      const links = createPaginationLinks(1, 1);
      
      expect(links).toEqual([
        { label: 1, page: 1, isActive: true }
      ]);
    });
    
    it('should create pagination links for multiple pages', () => {
      const links = createPaginationLinks(3, 5);
      
      expect(links).toHaveLength(5);
      expect(links.find(link => link.page === 3).isActive).toBe(true);
    });
    
    it('should include ellipsis for many pages', () => {
      const links = createPaginationLinks(5, 20);
      
      expect(links.some(link => link.label === '...')).toBe(true);
    });
  });
});
