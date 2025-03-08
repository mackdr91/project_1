/**
 * AI Invoice Generator Utility
 * 
 * This utility provides functions to generate invoice data based on natural language descriptions.
 * Currently uses a rule-based approach to simulate AI processing, but could be replaced with
 * a real AI service like OpenAI's GPT in the future.
 */

/**
 * Generate invoice data from a client description
 * @param {string} description - Natural language description of the work and client
 * @returns {Object} Generated invoice data
 */
export async function generateInvoiceFromDescription(description) {
  // In a real implementation, this would call an AI service
  // For now, we'll use a rule-based approach to simulate AI processing
  
  // Extract client information
  const clientInfo = extractClientInfo(description);
  
  // Extract service information
  const serviceInfo = extractServiceInfo(description);
  
  // Generate invoice items
  const items = generateInvoiceItems(serviceInfo);
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 8.5; // Default tax rate
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  // Generate due date (14 days from now)
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);
  
  // Return the generated invoice data
  return {
    client: clientInfo,
    items: items,
    subtotal: subtotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    total: total,
    dateIssued: today.toISOString(),
    dateDue: dueDate.toISOString(),
    notes: "Thank you for your business!",
    status: "draft",
    aiGenerated: true
  };
}

/**
 * Extract client information from description
 * @param {string} description - Description containing client information
 * @returns {Object} Client information
 */
function extractClientInfo(description) {
  // Default client info
  let clientInfo = {
    name: "Client",
    email: "client@example.com",
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA"
    }
  };
  
  // Look for company names (words ending with Inc, LLC, Co, Company, etc.)
  const companyRegex = /([A-Z][A-Za-z0-9\s]*(?:Inc\.?|LLC|Ltd\.?|Co\.?|Company|Corp\.?|Corporation))/g;
  const companyMatches = description.match(companyRegex);
  
  if (companyMatches && companyMatches.length > 0) {
    clientInfo.name = companyMatches[0].trim();
  } else {
    // Look for potential client names (2-3 consecutive capitalized words)
    const nameRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})/g;
    const nameMatches = description.match(nameRegex);
    
    if (nameMatches && nameMatches.length > 0) {
      // Use the first match as the client name
      clientInfo.name = nameMatches[0].trim();
    }
  }
  
  // Generate a plausible email based on the client name
  if (clientInfo.name !== "Client") {
    const emailName = clientInfo.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, '.'); // Replace spaces with dots
    
    clientInfo.email = `info@${emailName.split('.')[0]}.com`;
  }
  
  return clientInfo;
}

/**
 * Extract service information from description
 * @param {string} description - Description containing service information
 * @returns {Object} Service information
 */
function extractServiceInfo(description) {
  const serviceInfo = {
    type: "general",
    hourlyRate: 0,
    hours: 0,
    items: []
  };
  
  // Check for common service types
  const serviceTypes = [
    { type: "web", keywords: ["website", "web design", "web development", "landing page", "web app"] },
    { type: "design", keywords: ["design", "logo", "branding", "graphic", "ui/ux", "ui", "ux"] },
    { type: "marketing", keywords: ["marketing", "social media", "campaign", "seo", "content", "advertising"] },
    { type: "consulting", keywords: ["consulting", "consultation", "strategy", "advisor", "coaching"] },
    { type: "writing", keywords: ["writing", "copywriting", "content writing", "blog", "article"] },
    { type: "development", keywords: ["development", "programming", "coding", "software", "app", "application"] }
  ];
  
  // Determine service type based on keywords
  for (const service of serviceTypes) {
    for (const keyword of service.keywords) {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        serviceInfo.type = service.type;
        break;
      }
    }
    if (serviceInfo.type !== "general") break;
  }
  
  // Extract hourly rate if mentioned
  const rateRegex = /(\$\d+|\d+\s*dollars)(?:\s*\/\s*(?:hr|hour)|\s+(?:per|an)\s+hour)/i;
  const rateMatch = description.match(rateRegex);
  
  if (rateMatch) {
    const rateStr = rateMatch[1].replace('$', '').replace('dollars', '').trim();
    serviceInfo.hourlyRate = parseInt(rateStr, 10);
  } else {
    // Set default hourly rate based on service type
    switch (serviceInfo.type) {
      case "web": serviceInfo.hourlyRate = 85; break;
      case "design": serviceInfo.hourlyRate = 75; break;
      case "marketing": serviceInfo.hourlyRate = 90; break;
      case "consulting": serviceInfo.hourlyRate = 150; break;
      case "writing": serviceInfo.hourlyRate = 60; break;
      case "development": serviceInfo.hourlyRate = 100; break;
      default: serviceInfo.hourlyRate = 80;
    }
  }
  
  // Extract hours if mentioned
  const hoursRegex = /(\d+)\s*(?:hours|hrs|hour|hr)/i;
  const hoursMatch = description.match(hoursRegex);
  
  if (hoursMatch) {
    serviceInfo.hours = parseInt(hoursMatch[1], 10);
  } else {
    // Set default hours based on service type
    serviceInfo.hours = 10; // Default to 10 hours
  }
  
  // Extract specific items or deliverables
  const itemKeywords = [
    "page", "logo", "banner", "flyer", "brochure", "post", "article", 
    "report", "analysis", "campaign", "revision", "meeting"
  ];
  
  for (const keyword of itemKeywords) {
    const itemRegex = new RegExp(`(\\d+)\\s*${keyword}s?`, 'i');
    const itemMatch = description.match(itemRegex);
    
    if (itemMatch) {
      const quantity = parseInt(itemMatch[1], 10);
      serviceInfo.items.push({
        description: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
        quantity: quantity
      });
    }
  }
  
  return serviceInfo;
}

/**
 * Generate invoice items based on service information
 * @param {Object} serviceInfo - Service information
 * @returns {Array} Invoice items
 */
function generateInvoiceItems(serviceInfo) {
  const items = [];
  
  // Add service items from extracted information
  if (serviceInfo.items.length > 0) {
    for (const item of serviceInfo.items) {
      // Calculate a reasonable price based on the service type and item
      let unitPrice;
      
      switch (item.description.toLowerCase()) {
        case "page": unitPrice = 150; break;
        case "logo": unitPrice = 300; break;
        case "banner": unitPrice = 100; break;
        case "flyer": unitPrice = 120; break;
        case "brochure": unitPrice = 200; break;
        case "post": unitPrice = 50; break;
        case "article": unitPrice = 150; break;
        case "report": unitPrice = 250; break;
        case "analysis": unitPrice = 300; break;
        case "campaign": unitPrice = 500; break;
        case "revision": unitPrice = 75; break;
        case "meeting": unitPrice = 100; break;
        default: unitPrice = 100;
      }
      
      items.push({
        description: `${item.description} design/creation`,
        quantity: item.quantity,
        unitPrice: unitPrice,
        amount: item.quantity * unitPrice
      });
    }
  }
  
  // Add hourly service if hours are specified
  if (serviceInfo.hours > 0) {
    items.push({
      description: `${serviceInfo.type.charAt(0).toUpperCase() + serviceInfo.type.slice(1)} services`,
      quantity: serviceInfo.hours,
      unitPrice: serviceInfo.hourlyRate,
      amount: serviceInfo.hours * serviceInfo.hourlyRate
    });
  }
  
  // If no items were added, add a default item
  if (items.length === 0) {
    items.push({
      description: `Professional ${serviceInfo.type} services`,
      quantity: 1,
      unitPrice: serviceInfo.hourlyRate * 10,
      amount: serviceInfo.hourlyRate * 10
    });
  }
  
  return items;
}
