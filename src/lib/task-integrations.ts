

export interface Task {
    id: string
    title: string
    status: 'todo' | 'in-progress' | 'done'
    provider: 'jira' | 'trello' | 'asana' | 'github'
    url?: string
    priority?: 'low' | 'medium' | 'high'
    assignee?: string
    dueDate?: string
}

export interface TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github'
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
    ]
}

export class SimulationTaskAdapter implements TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github'
    name: string
    icon: string; // We'll handle icons safely in UI
    isConnected: boolean = false

    constructor(id: 'jira' | 'trello' | 'asana' | 'github', name: string) {
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

export const integrations = [
    new SimulationTaskAdapter('jira', 'Jira'),
    new SimulationTaskAdapter('trello', 'Trello'),
    new SimulationTaskAdapter('github', 'GitHub'),
    new SimulationTaskAdapter('asana', 'Asana')
]
