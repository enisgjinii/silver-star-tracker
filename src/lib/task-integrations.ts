

export interface Task {
    id: string
    title: string
    status: 'todo' | 'in-progress' | 'done'
    provider: 'jira' | 'trello' | 'asana' | 'github' | 'todoist'
    url?: string
    priority?: 'low' | 'medium' | 'high'
    assignee?: string
    dueDate?: string
}

export interface TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist'
    name: string
    icon: string
    isConnected: boolean
    connect: (token: string) => Promise<boolean>
    disconnect: () => void
    getTasks: () => Promise<Task[]>
}

const MOCK_TASKS: Record<string, Task[]> = {
    jira: [
        { id: 'JIRA-101', title: 'Implement Auth Flow', status: 'in-progress', provider: 'jira', priority: 'high', assignee: 'Enis', url: '#' },
        { id: 'JIRA-102', title: 'Update dependency tree', status: 'todo', provider: 'jira', priority: 'medium', assignee: 'Enis', url: '#' }
    ],
    trello: [
        { id: 'TR-55', title: 'Design Landing Page', status: 'done', provider: 'trello', priority: 'medium', url: '#' },
        { id: 'TR-56', title: 'User Interviews', status: 'todo', provider: 'trello', priority: 'low', url: '#' }
    ],
    github: [
        { id: 'GH-890', title: 'Fix overflow in sidebar', status: 'in-progress', provider: 'github', priority: 'high', url: '#' },
        { id: 'GH-891', title: 'Refactor value calculation', status: 'todo', provider: 'github', priority: 'medium', url: '#' }
    ],
    asana: [
        { id: 'AS-12', title: 'Q1 Marketing Plan', status: 'todo', provider: 'asana', priority: 'high', url: '#' }
    ],
    todoist: [
        { id: 'TD-1', title: 'Buy groceries', status: 'todo', provider: 'todoist', priority: 'medium', url: '#' },
        { id: 'TD-2', title: 'Schedule dentist appt', status: 'done', provider: 'todoist', priority: 'low', url: '#' },
        { id: 'TD-3', title: 'Finish Silver Star Project', status: 'in-progress', provider: 'todoist', priority: 'high', url: '#' }
    ]
}

export class SimulationTaskAdapter implements TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist'
    name: string
    icon: string; // We'll handle icons safely in UI
    isConnected: boolean = false

    constructor(id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist', name: string) {
        this.id = id
        this.name = name
        this.icon = ''

        // Load connection state from local storage
        this.isConnected = localStorage.getItem(`integration_${id}`) === 'true'
    }

    async connect(token: string): Promise<boolean> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulating success if token is provided (even dummy)
        if (token) {
            this.isConnected = true
            localStorage.setItem(`integration_${this.id}`, 'true')
            return true
        }
        return false
    }

    disconnect() {
        this.isConnected = false
        localStorage.removeItem(`integration_${this.id}`)
    }

    async getTasks(): Promise<Task[]> {
        if (!this.isConnected) return []

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        return MOCK_TASKS[this.id] || []
    }
}

export class TodoistAdapter implements TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist' = 'todoist'
    name: string = 'Todoist'
    icon: string = ''
    isConnected: boolean = false
    private token: string | null = null

    constructor() {
        const savedToken = localStorage.getItem('integration_todoist_token')
        if (savedToken) {
            this.token = savedToken
            this.isConnected = true
        }
    }

    async connect(token: string): Promise<boolean> {
        try {
            const response = await fetch('https://api.todoist.com/rest/v2/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                this.token = token
                this.isConnected = true
                localStorage.setItem('integration_todoist_token', token)
                return true
            }
        } catch (error) {
            console.error('Todoist connection failed:', error)
        }
        return false
    }

    disconnect() {
        this.isConnected = false
        this.token = null
        localStorage.removeItem('integration_todoist_token')
    }

    async getTasks(): Promise<Task[]> {
        if (!this.token) return []

        try {
            const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            })

            if (!response.ok) throw new Error('Failed to fetch tasks')

            const data = await response.json()

            return data.map((t: any) => ({
                id: t.id,
                title: t.content,
                status: 'todo', // Todoist tasks returned are usually 'active' (todo)
                provider: 'todoist',
                priority: this.mapPriority(t.priority),
                url: t.url,
                dueDate: t.due?.date
            }))
        } catch (error) {
            console.error('Error fetching Todoist tasks:', error)
            return []
        }
    }

    private mapPriority(p: number): 'low' | 'medium' | 'high' {
        // Todoist priorities are reverse: 4 is highest, 1 is lowest
        if (p === 4) return 'high'
        if (p === 3) return 'medium'
        return 'low'
    }
}

export const integrations = [
    new SimulationTaskAdapter('jira', 'Jira'),
    new SimulationTaskAdapter('trello', 'Trello'),
    new SimulationTaskAdapter('github', 'GitHub'),
    new SimulationTaskAdapter('asana', 'Asana'),
    new TodoistAdapter()
]
