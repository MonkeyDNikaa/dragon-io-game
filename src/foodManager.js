const { Food } = require('./entities');
const { CONFIG } = require('./config');

class FoodManager {
  constructor() {
    this.food = new Map();
    this.initFood();
  }

  initFood() {
    while (this.food.size < CONFIG.FOOD_COUNT) {
      this.spawnFood();
    }
  }

  spawnFood(x, y) {
    const food = x !== undefined && y !== undefined 
      ? new Food(x, y)
      : Food.random();
    this.food.set(food.id, food);
    return food;
  }

  removeFood(foodId) {
    return this.food.delete(foodId);
  }

  checkCollision(snake) {
    const eaten = [];
    
    for (const [id, food] of this.food) {
      const dx = food.x - snake.x;
      const dy = food.y - snake.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < snake.radius + food.radius) {
        eaten.push(id);
      }
    }
    
    return eaten;
  }

  consumeFood(foodIds, snake) {
    let consumed = 0;
    for (const id of foodIds) {
      if (this.food.has(id)) {
        this.food.delete(id);
        snake.grow();
        consumed++;
      }
    }
    return consumed;
  }

  maintainCount() {
    while (this.food.size < CONFIG.FOOD_COUNT) {
      this.spawnFood();
    }
  }

  spawnFromSnakeDeath(snake) {
    // Limite à 50 nourritures max par mort pour éviter le lag
    let spawned = 0;
    const maxSpawn = 50;
    
    for (const seg of snake.segments) {
      if (spawned >= maxSpawn) break;
      if (Math.random() < CONFIG.FOOD_PER_DEATH_SEGMENT) {
        this.spawnFood(
          seg.x + (Math.random() - 0.5) * 30,
          seg.y + (Math.random() - 0.5) * 30
        );
        spawned++;
      }
    }
  }

  getAll() {
    return Array.from(this.food.values());
  }

  toJSON() {
    return this.getAll();
  }
}

module.exports = FoodManager;
