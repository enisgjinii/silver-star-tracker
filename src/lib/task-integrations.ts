
export interface Task {
    id: string
    title: string
    status: 'todo' | 'in-progress' | 'done'
    provider: 'jira' | 'trello' | 'asana' | 'github' | 'todoist'
    url?: string
    priority?: 'low' | 'medium' | 'high'
    assignee?: string
    dueDate?: string
    projectName?: string
}

export interface TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist'
    name: string
    icon: string
    isConnected: boolean
    connect: (token: string) => Promise<boolean>
    disconnect: () => void
    getTasks: () => Promise<Task[]>
    completeTask?: (taskId: string) => Promise<boolean>
}

export class SimulationTaskAdapter implements TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist'
    name: string
    icon: string;
    isConnected: boolean = false

    constructor(id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist', name: string) {
        this.id = id
        this.name = name
        this.icon = ''
        this.isConnected = false
    }

    async connect(_token: string): Promise<boolean> {
        return false
    }

    disconnect() {
        this.isConnected = false
    }

    async getTasks(): Promise<Task[]> {
        return []
    }
}

export class TodoistAdapter implements TaskProvider {
    id: 'jira' | 'trello' | 'asana' | 'github' | 'todoist' = 'todoist'
    name: string = 'Todoist'
    icon: string = ''
    isConnected: boolean = false
    private token: string | null = null
    private projects: Record<string, string> = {}

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
            // Fetch projects first for mapping
            if (Object.keys(this.projects).length === 0) {
                await this.fetchProjects()
            }

            const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            })

            if (!response.ok) throw new Error('Failed to fetch tasks')

            const data = await response.json()

            return data.map((t: any) => ({
                id: t.id,
                title: t.content,
                status: 'todo',
                provider: 'todoist',
                priority: this.mapPriority(t.priority),
                url: t.url,
                dueDate: t.due ? t.due.date : undefined,
                projectName: this.projects[t.project_id] || 'Inbox'
            }))
        } catch (error) {
            console.error('Error fetching Todoist tasks:', error)
            return []
        }
    }

    async completeTask(taskId: string): Promise<boolean> {
        if (!this.token) return false
        try {
            const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${taskId}/close`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
            return response.ok
        } catch (error) {
            console.error('Error completing task:', error)
            return false
        }
    }

    private async fetchProjects() {
        if (!this.token) return
        try {
            const response = await fetch('https://api.todoist.com/rest/v2/projects', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
            if (response.ok) {
                const data = await response.json()
                data.forEach((p: any) => {
                    this.projects[p.id] = p.name
                })
            }
        } catch (e) { console.error(e) }
    }

    private mapPriority(p: number): 'low' | 'medium' | 'high' {
        if (p === 4) return 'high'
        if (p === 3) return 'medium'
        return 'low'
    }
}

export const integrations = [
    // Mocks removed. Only real integrations are enabled.
    new TodoistAdapter()
]
