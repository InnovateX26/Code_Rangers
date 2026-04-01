// ─── Merchant → Category Rule Engine ───
// Maps merchant keywords to spending categories

const CATEGORY_RULES = [
  {
    category: 'Food & Dining',
    icon: '🍕',
    color: '#FF6B6B',
    keywords: ['zomato', 'swiggy', 'dominos', 'pizza hut', 'mcdonalds', 'kfc', 'burger king', 'subway', 'starbucks', 'cafe coffee day', 'haldirams', 'barbeque nation', 'restaurant', 'food', 'dining', 'biryani', 'chai', 'dhaba']
  },
  {
    category: 'Shopping',
    icon: '🛍️',
    color: '#4ECDC4',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'snapdeal', 'nykaa', 'tata cliq', 'reliance digital', 'croma', 'big bazaar', 'dmart', 'mall', 'shopping']
  },
  {
    category: 'Travel & Transport',
    icon: '🚗',
    color: '#45B7D1',
    keywords: ['uber', 'ola', 'rapido', 'irctc', 'makemytrip', 'goibibo', 'redbus', 'metro', 'petrol', 'indian oil', 'hp petrol', 'bharat petroleum', 'parking', 'toll']
  },
  {
    category: 'Entertainment',
    icon: '🎬',
    color: '#96CEB4',
    keywords: ['netflix', 'hotstar', 'prime video', 'spotify', 'gaana', 'bookmyshow', 'pvr', 'inox', 'sony liv', 'zee5', 'jio cinema', 'youtube premium']
  },
  {
    category: 'Bills & Utilities',
    icon: '💡',
    color: '#FFEAA7',
    keywords: ['electricity', 'water bill', 'gas bill', 'broadband', 'jio', 'airtel', 'vi', 'bsnl', 'tata sky', 'dish tv', 'insurance', 'lic', 'municipal']
  },
  {
    category: 'Health & Fitness',
    icon: '💊',
    color: '#DDA0DD',
    keywords: ['pharmeasy', 'netmeds', '1mg', 'apollo', 'practo', 'cult.fit', 'gym', 'hospital', 'clinic', 'medical', 'pharmacy', 'doctor']
  },
  {
    category: 'Education',
    icon: '📚',
    color: '#87CEEB',
    keywords: ['udemy', 'coursera', 'unacademy', 'byju', 'school', 'college', 'tuition', 'books', 'stationery', 'exam']
  },
  {
    category: 'Groceries',
    icon: '🥦',
    color: '#98D8C8',
    keywords: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'jiomart', 'grofers', 'dunzo', 'vegetables', 'grocery', 'kirana', 'supermarket', 'milk']
  },
  {
    category: 'Money Transfer',
    icon: '💸',
    color: '#C9B1FF',
    keywords: ['transfer', 'sent to', 'received from', 'self transfer', 'neft', 'imps', 'rtgs']
  }
];

function categorize(merchantName) {
  const name = merchantName.toLowerCase();
  
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (name.includes(keyword)) {
        return {
          category: rule.category,
          icon: rule.icon,
          color: rule.color
        };
      }
    }
  }
  
  return {
    category: 'Other',
    icon: '📦',
    color: '#A0A0A0'
  };
}

function getAllCategories() {
  return [
    ...CATEGORY_RULES.map(r => ({ category: r.category, icon: r.icon, color: r.color })),
    { category: 'Other', icon: '📦', color: '#A0A0A0' }
  ];
}

module.exports = { categorize, getAllCategories, CATEGORY_RULES };
