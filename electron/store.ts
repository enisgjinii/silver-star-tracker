import Store from 'electron-store';

interface ActivityLog {
    timestamp: number;
    title?: string;
    owner?: {
        name: string;
    };
    idleTime: number;
}

const store = new Store<{
    activity: ActivityLog[];
}>({
    defaults: {
        activity: []
    }
});

export default store;
