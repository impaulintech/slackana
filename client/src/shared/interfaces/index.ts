import { IconType } from 'react-icons'

export interface Team {
  id: number
  name: string
  notif: number
}

export interface Link {
  href: string
  name: string
  Icon: IconType
}

export interface ProjectList {
  team_name: string
  icon: string
  date: string
  status: string
}

export interface Board {
  id: number | string
  name: string
  tasks?: Task[]
}

export interface Task {
  id: number
  position: number
  name: string
  assignee: {
    id: number
    name: string
    avatar: {
      url: string
      filename?: string
    }
  }
  is_completed: boolean
  due_date: string
  estimated_time: string
  actual_time_finished: string
}
