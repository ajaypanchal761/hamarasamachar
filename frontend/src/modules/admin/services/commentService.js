
// Mock data for comments
let comments = [
    {
        id: 1,
        text: 'Great article! Very informative.',
        news: { id: 101, title: 'Lok Sabha Election Results 2024' },
        user: { name: 'Rahul Sharma', contact: 'rahul@example.com' },
        date: '2025-12-10T10:30:00Z',
        status: 'Approved',
        replies: []
    },
    {
        id: 2,
        text: 'This is fake news!',
        news: { id: 102, title: 'New Tech Policy Announced' },
        user: { name: 'Priya Verma', contact: 'priya@example.com' },
        date: '2025-12-11T14:15:00Z',
        status: 'Pending',
        replies: []
    },
    {
        id: 3,
        text: 'Can you provide more details on this?',
        news: { id: 101, title: 'Lok Sabha Election Results 2024' },
        user: { name: 'Amit Singh', contact: 'amit@example.com' },
        date: '2025-12-12T09:00:00Z',
        status: 'Pending',
        replies: []
    },
    {
        id: 4,
        text: 'Spam comment with link http://spam.com',
        news: { id: 103, title: 'Cricket World Cup Final' },
        user: { name: 'Spammer', contact: 'spam@example.com' },
        date: '2025-12-13T08:45:00Z',
        status: 'Rejected',
        replies: []
    },
    {
        id: 5,
        text: 'I disagree with the author\'s point of view.',
        news: { id: 102, title: 'New Tech Policy Announced' },
        user: { name: 'Suresh Raina', contact: 'suresh@example.com' },
        date: '2025-12-13T11:20:00Z',
        status: 'Approved',
        replies: []
    }
];

const matchText = (text, query) => {
    if (!query) return true;
    return text.toLowerCase().includes(query.toLowerCase());
}

export const commentService = {
    getAllComments: async (filters = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...comments];

                if (filters.status && filters.status !== 'All') {
                    filtered = filtered.filter(c => c.status === filters.status);
                }

                if (filters.search) {
                    filtered = filtered.filter(c =>
                        matchText(c.text, filters.search) ||
                        (c.user && matchText(c.user.name, filters.search)) ||
                        (c.news && matchText(c.news.title, filters.search))
                    );
                }

                if (filters.startDate && filters.endDate) {
                    const start = new Date(filters.startDate).getTime();
                    const end = new Date(filters.endDate).getTime();
                    filtered = filtered.filter(c => {
                        const cDate = new Date(c.date).getTime();
                        return cDate >= start && cDate <= end;
                    });
                }

                // Sort by date desc
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

                resolve({ data: filtered, total: filtered.length });
            }, 500);
        });
    },

    updateCommentStatus: async (id, status) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                comments = comments.map(c =>
                    c.id === id ? { ...c, status } : c
                );
                resolve({ success: true });
            }, 300);
        });
    },

    deleteComment: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                comments = comments.filter(c => c.id !== id);
                resolve({ success: true });
            }, 300);
        });
    },

    replyToComment: async (id, replyText) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const comment = comments.find(c => c.id === id);
                if (comment) {
                    comment.replies.push({
                        text: replyText,
                        date: new Date().toISOString(),
                        user: { name: 'Admin', role: 'admin' }
                    });
                }
                resolve({ success: true });
            }, 300);
        });
    },

    getCommentStats: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const total = comments.length;
                const approved = comments.filter(c => c.status === 'Approved').length;
                const rejected = comments.filter(c => c.status === 'Rejected').length;
                const pending = comments.filter(c => c.status === 'Pending').length;

                resolve({
                    total,
                    approved,
                    rejected,
                    pending
                });
            }, 300);
        });
    }
};

