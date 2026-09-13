export type Tier = 'free' | 'pro' | 'premium'

export interface Profile {
  id: string
  email: string
  tier: Tier
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface TimeCategory {
  id: string
  user_id: string
  name: string
  hours_per_week: number
  target_hours?: number
  color: string
  created_at: string
}

export interface Priority {
  id: string
  text: string
  done: boolean
}

export interface WeeklyPlan {
  id: string
  user_id: string
  week_of: string
  top_priorities: Priority[]
  focus: string
  day_plans: Record<string, string>
  status: 'draft' | 'active' | 'complete'
  created_at: string
}

export interface DailyPlan {
  id: string
  user_id: string
  date: string
  tasks: Task[]
  top_three: string[]
  blocks: Record<string, string>
  notes: string
  energy_level?: number
  weekly_plan_id?: string
  created_at: string
}

export interface Task {
  id: string
  text: string
  done: boolean
}

export interface Goal {
  id: string
  user_id: string
  name: string
  area?: string
  description?: string
  next_action: string
  status: 'active' | 'complete' | 'archived'
  due_date?: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  frequency: 'daily' | 'weekly'
  position: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  completed_date: string
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_of: string
  what_worked?: string
  what_didnt?: string
  time_reflection?: string
  next_change?: string
  alignment_score: number
  created_at: string
}
