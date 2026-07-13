export interface Notice {
    id: string;
    title: string;
    body: string;
    isImportant: boolean;
    postedBy: string;
    createdAt: string;
    poster: {
        id: string;
        name: string;
    };
}