
import React, { useState } from 'react';
import RestaurantCard from './RestaurantCard';
import { cn } from '@/lib/utils';
import { SearchIcon, RestaurantIcon } from '@/assets/icons';
import { Input } from '@/components/ui/input';

// Sample restaurant data
const restaurants = [
  {
    id: '1',
    name: 'Urban Burger Bistro',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Burgers, American',
    rating: 4.8,
    deliveryTime: '20-35 min',
    minOrder: '$10',
    featured: true,
    isNew: false,
  },
  {
    id: '2',
    name: 'Sake Sushi House',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Japanese, Sushi',
    rating: 4.9,
    deliveryTime: '25-40 min',
    minOrder: '$15',
    featured: false,
    isNew: true,
  },
  {
    id: '3',
    name: 'Pasta Paradise',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Italian, Pasta',
    rating: 4.5,
    deliveryTime: '30-45 min',
    minOrder: '$12',
    featured: false,
    isNew: false,
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Mexican, Tacos',
    rating: 4.6,
    deliveryTime: '15-30 min',
    minOrder: '$8',
    featured: true,
    isNew: false,
  },
  {
    id: '5',
    name: 'Green Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Healthy, Salads',
    rating: 4.7,
    deliveryTime: '15-25 min',
    minOrder: '$9',
    featured: false,
    isNew: true,
  },
  {
    id: '6',
    name: 'Spice of India',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Indian, Curry',
    rating: 4.4,
    deliveryTime: '35-50 min',
    minOrder: '$15',
    featured: false,
    isNew: false,
  }
];

// Filter categories
const cuisineFilters = [
  'All',
  'American',
  'Japanese',
  'Italian',
  'Mexican',
  'Healthy',
  'Indian'
];

interface RestaurantListProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

const RestaurantList = ({
  title = 'Restaurants Near You',
  subtitle,
  maxItems = restaurants.length,
  showFilters = true,
  showSearch = true,
  className
}: RestaurantListProps) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter restaurants based on active filter and search query
  const filteredRestaurants = restaurants
    .filter(restaurant => 
      activeFilter === 'All' || restaurant.cuisine.includes(activeFilter)
    )
    .filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, maxItems);
  
  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
      </div>
      
      {/* Filters and search */}
      {(showFilters || showSearch) && (
        <div className="mb-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* Cuisine filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {cuisineFilters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full transition-all',
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          
          {/* Search */}
          {showSearch && (
            <div className="relative max-w-xs w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Restaurant grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              {...restaurant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/50 rounded-lg">
          <RestaurantIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium">No restaurants found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
