import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  dateIssued: {
    type: Date,
    default: Date.now
  },
  dateDue: {
    type: Date,
    required: true
  },
  client: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    datePaid: Date
  },
  aiGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate a unique invoice number before saving
InvoiceSchema.pre('save', async function(next) {
  // Only generate invoice number if one doesn't exist and this is a new document
  if (this.invoiceNumber || !this.isNew) {
    return next();
  }
  
  try {
    // Make sure we're using the correct model reference
    const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
    const count = await Invoice.countDocuments();
    
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Generate the invoice number
    this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    next();
  } catch (error) {
    console.error('Error generating invoice number:', error);
    next(error);
  }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
