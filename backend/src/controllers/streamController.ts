import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Global map of connected clients: userId -> Response
const clients = new Map<string, Response>();

export function sseHandler(req: Request, res: Response) {
    const token = req.query.token as string;
    
    if (!token) {
        return res.status(401).send("Unauthorized: Missing token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string, role: string };
        const userId = decoded.userId;

        // Set up headers for SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders(); // flush the headers to establish connection

        // Add to clients map
        clients.set(userId, res);
        
        // Remove client on connection close
        req.on("close", () => {
            clients.delete(userId);
        });

        // Send an initial ping to keep the connection alive
        res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

    } catch (err) {
        return res.status(401).send("Unauthorized: Invalid token");
    }
}

// Helper to broadcast to a specific user
export function notifyUser(userId: string, type: string, data: any) {
    const res = clients.get(userId);
    if (res) {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    }
}

// Helper to broadcast to all connected users
export function broadcast(type: string, data: any) {
    for (const res of clients.values()) {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    }
}
