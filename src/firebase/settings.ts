// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SALES: 'sales',
  REGISTERS: 'registers',
  REGISTER_CLOSINGS: 'registerClosings'
} as const;

// Default values
export const DEFAULTS = {
  ADMIN_USER: {
    name: 'Admin',
    pin: '1234',
    role: 'admin'
  },
  CASHIER_USER: {
    name: 'Cajero',
    pin: '5678',
    role: 'cashier'
  },
  DEMO_CATEGORIES: [
    { name: 'Bebidas' },
    { name: 'Comidas' },
    { name: 'Postres' }
  ],
  DEMO_PRODUCTS: [
    {
      name: 'Café Americano',
      price: 2.50,
      categoryIndex: 0
    },
    {
      name: 'Sandwich de Jamón y Queso',
      price: 4.75,
      categoryIndex: 1
    },
    {
      name: 'Jugo de Naranja',
      price: 3.00,
      categoryIndex: 0
    }
  ]
} as const;

// Validation rules
export const VALIDATION = {
  PIN: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 6
  },
  PRICE: {
    MIN: 0
  }
} as const;

// Error messages
export const ERRORS = {
  AUTH: {
    NO_USER: 'No user is logged in',
    INVALID_PIN: 'PIN inválido',
    PIN_LENGTH: `El PIN debe tener entre ${VALIDATION.PIN.MIN_LENGTH} y ${VALIDATION.PIN.MAX_LENGTH} dígitos`
  },
  REGISTER: {
    NOT_OPEN: 'La caja no está abierta',
    ALREADY_OPEN: 'Ya hay una caja abierta',
    INVALID_AMOUNT: 'El monto debe ser mayor a 0'
  },
  PRODUCTS: {
    INVALID_PRICE: `El precio debe ser mayor a ${VALIDATION.PRICE.MIN}`,
    NAME_REQUIRED: 'El nombre del producto es requerido'
  },
  CATEGORIES: {
    NAME_REQUIRED: 'El nombre de la categoría es requerido',
    HAS_PRODUCTS: 'No se puede eliminar la categoría porque tiene productos asociados'
  }
} as const;