// Mock data for the IT Ticket Classification System

export type UserRole = 'end_user' | 'helpdesk' | 'admin';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export type TicketCategory = 
  | 'Hardware' 
  | 'Software' 
  | 'Network' 
  | 'Database' 
  | 'Security' 
  | 'Email' 
  | 'Other';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  predictedCategory?: TicketCategory;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  assignedTo?: string;
  hasPII?: boolean;
}

export interface PredictionResult {
  category: TicketCategory;
  confidence: number;
  requiresManualReview: boolean;
}

export interface ConfusionMatrixData {
  actual: TicketCategory;
  predicted: TicketCategory;
  count: number;
}

export interface F1ScoreData {
  date: string;
  f1Score: number;
  precision: number;
  recall: number;
}

export interface DepartmentLoadData {
  department: TicketCategory;
  count: number;
  percentage: number;
}

// Mock Users
export const mockUsers: User[] = [
  { id: 'u1', username: 'jsmith', name: 'John Smith', email: 'jsmith@company.com', role: 'end_user' },
  { id: 'u2', username: 'mjohnson', name: 'Maria Johnson', email: 'mjohnson@company.com', role: 'end_user' },
  { id: 'u3', username: 'analyst1', name: 'Alex Chen', email: 'achen@company.com', role: 'helpdesk' },
  { id: 'u4', username: 'analyst2', name: 'Sarah Williams', email: 'swilliams@company.com', role: 'helpdesk' },
  { id: 'u5', username: 'admin', name: 'Michael Brown', email: 'mbrown@company.com', role: 'admin' },
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: 'T-001',
    subject: 'Cannot connect to VPN',
    description: 'Since this morning, I am unable to connect to the corporate VPN. The connection times out after 30 seconds. I have tried restarting my computer and router but the issue persists.',
    status: 'pending',
    category: 'Network',
    predictedCategory: 'Network',
    confidenceScore: 0.94,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    userId: 'u1',
    userName: 'John Smith',
    hasPII: false,
  },
  {
    id: 'T-002',
    subject: 'Email not syncing on mobile',
    description: 'My work email stopped syncing on my iPhone yesterday. I can still access it from my laptop. My phone is connected to WiFi and other apps are working fine.',
    status: 'in_progress',
    category: 'Email',
    predictedCategory: 'Email',
    confidenceScore: 0.89,
    createdAt: '2024-01-15T10:15:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    userId: 'u2',
    userName: 'Maria Johnson',
    assignedTo: 'u3',
    hasPII: false,
  },
  {
    id: 'T-003',
    subject: 'Database query running slow',
    description: 'The monthly reports query is taking over 30 minutes to complete. It used to finish in under 5 minutes. Server IP: 192.168.1.*** (redacted). Need urgent assistance.',
    status: 'pending',
    category: 'Database',
    predictedCategory: 'Database',
    confidenceScore: 0.97,
    createdAt: '2024-01-15T11:45:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    userId: 'u1',
    userName: 'John Smith',
    hasPII: true,
  },
  {
    id: 'T-004',
    subject: 'New software installation request',
    description: 'I need Adobe Creative Suite installed on my workstation for the upcoming marketing campaign. Department: Marketing. Manager approval: Pending.',
    status: 'pending',
    category: 'Software',
    predictedCategory: 'Software',
    confidenceScore: 0.85,
    createdAt: '2024-01-15T13:20:00Z',
    updatedAt: '2024-01-15T13:20:00Z',
    userId: 'u2',
    userName: 'Maria Johnson',
    hasPII: false,
  },
  {
    id: 'T-005',
    subject: 'Laptop screen flickering',
    description: 'My laptop screen has been flickering intermittently for the past two days. It happens more frequently when the laptop is connected to the external monitor. Model: Dell XPS 15.',
    status: 'in_progress',
    category: 'Hardware',
    predictedCategory: 'Hardware',
    confidenceScore: 0.92,
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    userId: 'u1',
    userName: 'John Smith',
    assignedTo: 'u4',
    hasPII: false,
  },
  {
    id: 'T-006',
    subject: 'Suspicious email received',
    description: 'I received an email claiming to be from IT asking for my password. The sender address looks suspicious. I did not click any links. Should I report this?',
    status: 'resolved',
    category: 'Security',
    predictedCategory: 'Security',
    confidenceScore: 0.96,
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
    userId: 'u2',
    userName: 'Maria Johnson',
    assignedTo: 'u3',
    hasPII: false,
  },
  {
    id: 'T-007',
    subject: 'Printer not recognized',
    description: 'The network printer on the 3rd floor is not showing up on my computer. Other colleagues can print to it. I have tried reinstalling the printer drivers.',
    status: 'pending',
    category: 'Hardware',
    predictedCategory: 'Network',
    confidenceScore: 0.52,
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    userId: 'u1',
    userName: 'John Smith',
    hasPII: false,
  },
  {
    id: 'T-008',
    subject: 'Access to shared folder denied',
    description: 'I cannot access the Finance shared folder anymore. I had access last week. Error: "Access Denied". My username is jsmith@company.com.',
    status: 'resolved',
    category: 'Security',
    predictedCategory: 'Security',
    confidenceScore: 0.88,
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-13T16:30:00Z',
    userId: 'u1',
    userName: 'John Smith',
    assignedTo: 'u4',
    hasPII: true,
  },
];

// F1 Score Historical Data (last 30 days)
export const mockF1ScoreData: F1ScoreData[] = [
  { date: '2024-01-01', f1Score: 0.82, precision: 0.85, recall: 0.79 },
  { date: '2024-01-02', f1Score: 0.83, precision: 0.86, recall: 0.80 },
  { date: '2024-01-03', f1Score: 0.81, precision: 0.84, recall: 0.78 },
  { date: '2024-01-04', f1Score: 0.84, precision: 0.87, recall: 0.81 },
  { date: '2024-01-05', f1Score: 0.85, precision: 0.88, recall: 0.82 },
  { date: '2024-01-06', f1Score: 0.86, precision: 0.88, recall: 0.84 },
  { date: '2024-01-07', f1Score: 0.85, precision: 0.87, recall: 0.83 },
  { date: '2024-01-08', f1Score: 0.87, precision: 0.89, recall: 0.85 },
  { date: '2024-01-09', f1Score: 0.88, precision: 0.90, recall: 0.86 },
  { date: '2024-01-10', f1Score: 0.87, precision: 0.89, recall: 0.85 },
  { date: '2024-01-11', f1Score: 0.89, precision: 0.91, recall: 0.87 },
  { date: '2024-01-12', f1Score: 0.90, precision: 0.92, recall: 0.88 },
  { date: '2024-01-13', f1Score: 0.89, precision: 0.91, recall: 0.87 },
  { date: '2024-01-14', f1Score: 0.91, precision: 0.93, recall: 0.89 },
  { date: '2024-01-15', f1Score: 0.92, precision: 0.94, recall: 0.90 },
];

// Department Load Distribution
export const mockDepartmentLoadData: DepartmentLoadData[] = [
  { department: 'Software', count: 145, percentage: 28 },
  { department: 'Network', count: 98, percentage: 19 },
  { department: 'Hardware', count: 87, percentage: 17 },
  { department: 'Security', count: 72, percentage: 14 },
  { department: 'Database', count: 56, percentage: 11 },
  { department: 'Email', count: 42, percentage: 8 },
  { department: 'Other', count: 15, percentage: 3 },
];

// Confusion Matrix Data
export const mockConfusionMatrixData: ConfusionMatrixData[] = [
  // Hardware predictions
  { actual: 'Hardware', predicted: 'Hardware', count: 85 },
  { actual: 'Hardware', predicted: 'Software', count: 3 },
  { actual: 'Hardware', predicted: 'Network', count: 2 },
  { actual: 'Hardware', predicted: 'Database', count: 0 },
  { actual: 'Hardware', predicted: 'Security', count: 1 },
  { actual: 'Hardware', predicted: 'Email', count: 0 },
  { actual: 'Hardware', predicted: 'Other', count: 1 },
  
  // Software predictions
  { actual: 'Software', predicted: 'Hardware', count: 4 },
  { actual: 'Software', predicted: 'Software', count: 138 },
  { actual: 'Software', predicted: 'Network', count: 2 },
  { actual: 'Software', predicted: 'Database', count: 1 },
  { actual: 'Software', predicted: 'Security', count: 0 },
  { actual: 'Software', predicted: 'Email', count: 0 },
  { actual: 'Software', predicted: 'Other', count: 0 },
  
  // Network predictions
  { actual: 'Network', predicted: 'Hardware', count: 3 },
  { actual: 'Network', predicted: 'Software', count: 1 },
  { actual: 'Network', predicted: 'Network', count: 91 },
  { actual: 'Network', predicted: 'Database', count: 1 },
  { actual: 'Network', predicted: 'Security', count: 2 },
  { actual: 'Network', predicted: 'Email', count: 0 },
  { actual: 'Network', predicted: 'Other', count: 0 },
  
  // Database predictions
  { actual: 'Database', predicted: 'Hardware', count: 0 },
  { actual: 'Database', predicted: 'Software', count: 2 },
  { actual: 'Database', predicted: 'Network', count: 1 },
  { actual: 'Database', predicted: 'Database', count: 52 },
  { actual: 'Database', predicted: 'Security', count: 1 },
  { actual: 'Database', predicted: 'Email', count: 0 },
  { actual: 'Database', predicted: 'Other', count: 0 },
  
  // Security predictions
  { actual: 'Security', predicted: 'Hardware', count: 0 },
  { actual: 'Security', predicted: 'Software', count: 1 },
  { actual: 'Security', predicted: 'Network', count: 2 },
  { actual: 'Security', predicted: 'Database', count: 0 },
  { actual: 'Security', predicted: 'Security', count: 68 },
  { actual: 'Security', predicted: 'Email', count: 1 },
  { actual: 'Security', predicted: 'Other', count: 0 },
  
  // Email predictions
  { actual: 'Email', predicted: 'Hardware', count: 0 },
  { actual: 'Email', predicted: 'Software', count: 1 },
  { actual: 'Email', predicted: 'Network', count: 1 },
  { actual: 'Email', predicted: 'Database', count: 0 },
  { actual: 'Email', predicted: 'Security', count: 2 },
  { actual: 'Email', predicted: 'Email', count: 38 },
  { actual: 'Email', predicted: 'Other', count: 0 },
  
  // Other predictions
  { actual: 'Other', predicted: 'Hardware', count: 1 },
  { actual: 'Other', predicted: 'Software', count: 2 },
  { actual: 'Other', predicted: 'Network', count: 1 },
  { actual: 'Other', predicted: 'Database', count: 0 },
  { actual: 'Other', predicted: 'Security', count: 0 },
  { actual: 'Other', predicted: 'Email', count: 0 },
  { actual: 'Other', predicted: 'Other', count: 11 },
];

// Dashboard Summary Stats
export const mockDashboardStats = {
  avgMTTA: 45, // minutes
  ticketsToday: 23,
  modelAccuracy: 92.4,
  indeterminateTickets: 7,
  totalTicketsWeek: 156,
  resolvedToday: 18,
  pendingTickets: 12,
  confidenceThreshold: 70,
};

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

// Helper function to get tickets by user ID
export function getTicketsByUserId(userId: string): Ticket[] {
  return mockTickets.filter(ticket => ticket.userId === userId);
}

// Helper function to get pending tickets for helpdesk
export function getPendingTickets(): Ticket[] {
  return mockTickets.filter(ticket => ticket.status === 'pending' || ticket.status === 'in_progress');
}

// Helper function to simulate AI prediction
export function predictCategory(description: string): PredictionResult {
  // Simple mock prediction based on keywords
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('database') || lowerDesc.includes('query') || lowerDesc.includes('sql')) {
    return { category: 'Database', confidence: 0.94, requiresManualReview: false };
  }
  if (lowerDesc.includes('network') || lowerDesc.includes('vpn') || lowerDesc.includes('internet') || lowerDesc.includes('wifi')) {
    return { category: 'Network', confidence: 0.91, requiresManualReview: false };
  }
  if (lowerDesc.includes('email') || lowerDesc.includes('outlook') || lowerDesc.includes('mail')) {
    return { category: 'Email', confidence: 0.88, requiresManualReview: false };
  }
  if (lowerDesc.includes('password') || lowerDesc.includes('access') || lowerDesc.includes('security') || lowerDesc.includes('suspicious')) {
    return { category: 'Security', confidence: 0.92, requiresManualReview: false };
  }
  if (lowerDesc.includes('install') || lowerDesc.includes('software') || lowerDesc.includes('application') || lowerDesc.includes('app')) {
    return { category: 'Software', confidence: 0.86, requiresManualReview: false };
  }
  if (lowerDesc.includes('laptop') || lowerDesc.includes('computer') || lowerDesc.includes('monitor') || lowerDesc.includes('printer') || lowerDesc.includes('screen')) {
    return { category: 'Hardware', confidence: 0.89, requiresManualReview: false };
  }
  
  // Low confidence - requires manual review
  return { category: 'Other', confidence: 0.45, requiresManualReview: true };
}
