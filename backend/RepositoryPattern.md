# Repository Pattern - Complete Learning Guide

## 🎯 What is Repository Pattern?

The **Repository Pattern** is a design pattern that separates the logic that retrieves data from the business logic. It creates a **uniform interface** for accessing data, regardless of the data source (database, file, web service, etc.).

### Simple Analogy 📚
Think of it like a **library system**:
- **Librarian (Repository)**: Knows where to find books, how to organize them
- **Student (Service)**: Knows what research they need to do  
- **Reception (Controller)**: Handles requests from visitors
- **Books (Models)**: The actual data/information

## 🏗️ Architecture Layers in Repository Pattern

```
┌─────────────────┐
│   CONTROLLER    │ ← HTTP Requests/Responses
└─────────────────┘
         ↓
┌─────────────────┐
│    SERVICE      │ ← Business Logic & Rules
└─────────────────┘
         ↓
┌─────────────────┐
│   REPOSITORY    │ ← Data Access Logic
└─────────────────┘
         ↓
┌─────────────────┐
│     MODEL       │ ← Data Structure
└─────────────────┘
         ↓
┌─────────────────┐
│    DATABASE     │ ← Actual Data Storage
└─────────────────┘
```

## 📋 Layer Responsibilities

### 🎮 Controller Layer
**What it does**: Handles HTTP communication

**Responsibilities**:
- ✅ Receive HTTP requests
- ✅ Validate request format (basic validation)
- ✅ Call appropriate service methods
- ✅ Format and send HTTP responses
- ✅ Handle HTTP status codes
- ✅ Error handling for HTTP layer

**What it SHOULD NOT do**:
- ❌ Business logic
- ❌ Database operations
- ❌ Data validation (complex)
- ❌ Authentication logic (should be middleware)

**Example**:
```typescript
class UserController {
  constructor(private userService: IUserService) {}

  // ✅ Good: Simple, focused on HTTP handling
  async getUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ❌ Bad: Business logic in controller
  async createUser(req: Request, res: Response) {
    // Don't do this in controller!
    if (req.body.age < 18) {
      return res.status(400).json({ error: 'Must be 18+' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // ... more business logic
  }
}
```

### 🧠 Service Layer  
**What it does**: Contains business logic and orchestrates operations

**Responsibilities**:
- ✅ Business rules and validation
- ✅ Complex data processing
- ✅ Orchestrate multiple repositories
- ✅ Handle transactions
- ✅ Generate business-specific data (tokens, calculations)
- ✅ Logging business events
- ✅ Call external services/APIs

**What it SHOULD NOT do**:
- ❌ Direct database queries
- ❌ HTTP request/response handling
- ❌ UI-specific logic

**Example**:
```typescript
class UserService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  // ✅ Good: Business logic and orchestration
  async registerUser(userData: RegisterDTO) {
    // Business rule: Check if user exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Business logic: Password hashing
    const hashedPassword = await this.hashPassword(userData.password);

    // Orchestration: Create user and send welcome email
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    await this.emailService.sendWelcomeEmail(user.email);
    
    return user;
  }

  // ❌ Bad: Direct database access
  async getUser(id: string) {
    // Don't do this in service!
    return await User.findById(id); // Direct model access
  }
}
```

### 💾 Repository Layer
**What it does**: Abstracts data access operations

**Responsibilities**:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Complex database queries
- ✅ Data mapping and transformation
- ✅ Database-specific optimizations
- ✅ Caching logic
- ✅ Database transaction handling

**What it SHOULD NOT do**:
- ❌ Business logic
- ❌ Authentication/authorization
- ❌ HTTP handling
- ❌ External API calls

**Example**:
```typescript
class UserRepository {
  constructor(private model: Model<IUser>) {}

  // ✅ Good: Pure data access
  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  async findActiveUsersWithPagination(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.model
      .find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  // ❌ Bad: Business logic in repository
  async createUser(userData: any) {
    // Don't do this in repository!
    if (userData.age < 18) {
      throw new Error('Must be 18+'); // Business rule doesn't belong here
    }
    return this.model.create(userData);
  }
}
```

### 📋 Model Layer
**What it does**: Defines data structure and basic validation

**Responsibilities**:
- ✅ Data structure definition
- ✅ Basic field validation (required, format, length)
- ✅ Database schema definition
- ✅ Indexes for performance
- ✅ Simple instance methods
- ✅ Database hooks (pre/post save)

**Example**:
```typescript
const userSchema = new Schema({
  firstName: { 
    type: String, 
    required: true, 
    maxlength: 50 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: (v) => /\S+@\S+\.\S+/.test(v),
      message: 'Invalid email format'
    }
  },
  age: { 
    type: Number, 
    min: 0, 
    max: 150 
  }
});

// ✅ Good: Simple instance method
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// ❌ Bad: Business logic in model
userSchema.pre('save', function() {
  // Don't do complex business logic here!
  if (this.age < 18) {
    throw new Error('Business rule violation');
  }
});
```

## 🎓 What You Need to Learn

### 1. **Basic Concepts** 📚
- [ ] What is separation of concerns?
- [ ] What is dependency injection?
- [ ] What are interfaces and abstractions?
- [ ] What is the difference between business logic and data access?

### 2. **Repository Pattern Fundamentals** 🔧
- [ ] Why do we separate data access from business logic?
- [ ] What are the benefits of using interfaces?
- [ ] How does repository pattern improve testability?
- [ ] What is the difference between repository and DAO (Data Access Object)?

### 3. **Implementation Patterns** 💻
- [ ] Generic/Base Repository pattern
- [ ] Specific Repository implementations
- [ ] Unit of Work pattern (for transactions)
- [ ] Specification pattern (for complex queries)

### 4. **Advanced Topics** 🚀
- [ ] Repository with caching
- [ ] Repository for different data sources (SQL, NoSQL, API)
- [ ] Event sourcing with repositories
- [ ] CQRS (Command Query Responsibility Segregation)

### 5. **Testing** 🧪
- [ ] How to mock repositories for unit testing
- [ ] Integration testing with real databases
- [ ] Test data builders and factories

## 🔄 Request Flow Example

Let's trace a **"Get User Orders"** request:

### Step 1: HTTP Request
```
GET /api/v1/users/123/orders?page=1&limit=10
```

### Step 2: Controller
```typescript
class UserController {
  async getUserOrders(req: Request, res: Response) {
    // ✅ Extract parameters
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // ✅ Call service
    const orders = await this.userService.getUserOrders(userId, page, limit);
    
    // ✅ Send response
    res.json({ success: true, data: orders });
  }
}
```

### Step 3: Service
```typescript
class UserService {
  async getUserOrders(userId: string, page: number, limit: number) {
    // ✅ Business rule: Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // ✅ Business rule: Check if user can view orders
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // ✅ Delegate to repository
    return this.orderRepository.findByUserId(userId, page, limit);
  }
}
```

### Step 4: Repository
```typescript
class OrderRepository {
  async findByUserId(userId: string, page: number, limit: number) {
    // ✅ Data access logic
    const skip = (page - 1) * limit;
    
    return this.model
      .find({ userId })
      .populate('deliveryPartner')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}
```

## ✅ Benefits of Repository Pattern

### 1. **Testability** 🧪
```typescript
// Easy to mock for testing
const mockUserRepo = { findById: jest.fn() };
const userService = new UserService(mockUserRepo);

// Test business logic without database
await userService.getUserOrders('123', 1, 10);
expect(mockUserRepo.findById).toHaveBeenCalledWith('123');
```

### 2. **Maintainability** 🔧
- Changes to database don't affect business logic
- Business rules are centralized in services
- Easy to add new features

### 3. **Flexibility** 🔄
```typescript
// Can switch database implementations
interface IUserRepository {
  findById(id: string): Promise<User>;
}

class MongoUserRepository implements IUserRepository { ... }
class PostgreSQLUserRepository implements IUserRepository { ... }
class InMemoryUserRepository implements IUserRepository { ... }
```

### 4. **Reusability** ♻️
```typescript
// Base repository with common methods
class BaseRepository<T> {
  async findById(id: string): Promise<T> { ... }
  async create(data: T): Promise<T> { ... }
  async update(id: string, data: Partial<T>): Promise<T> { ... }
}

// All repositories inherit common functionality
class UserRepository extends BaseRepository<User> { ... }
class OrderRepository extends BaseRepository<Order> { ... }
```

## ❌ Common Mistakes to Avoid

### 1. **Fat Controllers**
```typescript
// ❌ Bad: Too much logic in controller
class UserController {
  async createUser(req: Request, res: Response) {
    // Business logic should be in service!
    if (req.body.age < 18) return res.status(400).json({...});
    if (await User.findOne({email: req.body.email})) return res.status(400).json({...});
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({...req.body, password: hashedPassword});
    res.json(user);
  }
}
```

### 2. **Anemic Services**
```typescript
// ❌ Bad: Service just passes data through
class UserService {
  async getUser(id: string) {
    return this.userRepository.findById(id); // No business logic!
  }
}
```

### 3. **Smart Repositories**
```typescript
// ❌ Bad: Business logic in repository
class UserRepository {
  async createUser(userData: any) {
    // Business rules don't belong here!
    if (userData.age < 18) throw new Error('Too young');
    if (userData.role === 'admin') throw new Error('Cannot create admin');
    return this.model.create(userData);
  }
}
```

### 4. **Direct Model Access**
```typescript
// ❌ Bad: Bypassing repository
class UserService {
  async getUser(id: string) {
    return User.findById(id); // Should use repository!
  }
}
```

## 🎯 Best Practices

### 1. **Keep Controllers Thin**
- Only handle HTTP concerns
- Delegate everything else to services

### 2. **Keep Services Focused**
- One service per business domain
- Clear business logic, no data access

### 3. **Keep Repositories Pure**
- Only data access operations
- No business rules

### 4. **Use Interfaces**
- Define contracts for dependencies
- Makes testing and swapping implementations easy

### 5. **Handle Errors Appropriately**
- Business errors in services
- Data access errors in repositories
- HTTP errors in controllers

## 📖 Learning Resources

### Books 📚
- "Clean Architecture" by Robert C. Martin
- "Domain-Driven Design" by Eric Evans
- "Patterns of Enterprise Application Architecture" by Martin Fowler

### Online Resources 🌐
- Martin Fowler's Repository Pattern article
- Clean Code principles
- SOLID principles tutorial
- Dependency Injection patterns

### Practice Projects 💻
- Build a simple CRUD app with repository pattern
- Implement the same repository with different databases
- Write unit tests for services using mocked repositories

## 🎉 Conclusion

The Repository Pattern helps you build:
- **Clean, maintainable code**
- **Testable applications**
- **Flexible architecture**
- **Scalable systems**

Start with understanding the **separation of concerns** and gradually implement each layer with its specific responsibilities. Practice with small projects and gradually tackle more complex scenarios!

Remember: **Each layer should have a single, clear responsibility** 🎯