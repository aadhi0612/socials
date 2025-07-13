export declare const API_BASE: string;
export declare function getUser(id: string): Promise<any>;
export declare function getCurrentUser(id: string): Promise<any>;
export declare function createUser(user: {
    name: string;
    email: string;
    password: string;
}): Promise<any>;
export declare function login(email: string, password: string): Promise<any>;
