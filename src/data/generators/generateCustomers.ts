import type { Customer } from '@/types'
import { createSeededRandom, formatDate, pick, randomInt } from './seedUtils'

const rand = createSeededRandom(101)

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Arjun', 'Ananya', 'Vikram', 'Kavya', 'Rohan', 'Sneha', 'Aditya', 'Meera',
  'Karan', 'Divya', 'Sanjay', 'Pooja', 'Nikhil', 'Shreya', 'Amit', 'Neha', 'Varun', 'Isha',
  'Deepak', 'Anjali', 'Manish', 'Ritu', 'Suresh', 'Lakshmi', 'Harish', 'Swati', 'Gaurav', 'Tanvi',
  'Rajesh', 'Nisha', 'Ashwin', 'Preeti', 'Vivek', 'Aishwarya', 'Siddharth', 'Kritika', 'Pranav', 'Simran',
  'Akash', 'Bhavna', 'Ravi', 'Chitra', 'Mohit', 'Geeta', 'Anil', 'Sunita', 'Tarun', 'Revathi',
]

const LAST_NAMES = [
  'Sharma', 'Patel', 'Mehta', 'Reddy', 'Singh', 'Nair', 'Iyer', 'Gupta', 'Kumar', 'Desai',
  'Joshi', 'Menon', 'Rao', 'Kapoor', 'Malhotra', 'Verma', 'Chopra', 'Bose', 'Pillai', 'Shetty',
  'Khanna', 'Aggarwal', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Naidu', 'Kulkarni', 'Hegde', 'Saxena', 'Tiwari',
]

const CITIES = [
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
]

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.')
}

export const customers: Customer[] = Array.from({ length: 100 }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length]
  const last = pick(rand, LAST_NAMES)
  const name = `${first} ${last}${i > 49 ? ` ${Math.floor(i / 50)}` : ''}`.trim()
  const location = pick(rand, CITIES)
  const joinedDaysAgo = randomInt(rand, 30, 720)
  return {
    id: String(i + 1),
    name,
    email: `${slugify(name)}@gmail.com`,
    phone: `+91 ${randomInt(rand, 70000, 99999)} ${randomInt(rand, 10000, 99999)}`,
    city: location.city,
    state: location.state,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: formatDate(joinedDaysAgo),
    status: rand() > 0.12 ? 'active' : 'inactive',
    joinedAt: formatDate(joinedDaysAgo),
  }
})
