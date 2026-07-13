import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
    console.log("Seeding database...");

    // Admin
    const adminPassword = await bcrypt.hash("Admin@2026", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@greenparksociety.com" },
        update: {},
        create: {
            name: "Society Admin",
            email: "admin@greenparksociety.com",
            passwordHash: adminPassword,
            role: "ADMIN",
        },
    });
    console.log("Admin seeded.");

    // Residents
    const resPassword = await bcrypt.hash("resident123", 10);
    const residentsData = [
        { name: "Amit Kulkarni", email: "amit.kulkarni@example.com", flatNo: "101", wing: "A", phone: "+91 9876543210" },
        { name: "Priya Deshmukh", email: "priya.deshmukh@example.com", flatNo: "204", wing: "B", phone: "+91 8765432109" },
        { name: "Rohan Patil", email: "rohan.patil@example.com", flatNo: "305", wing: "A", phone: "+91 7654321098" },
    ];

    const residents = [];
    for (const data of residentsData) {
        const res = await prisma.user.upsert({
            where: { email: data.email },
            update: {},
            create: {
                name: data.name,
                email: data.email,
                passwordHash: resPassword,
                role: "RESIDENT",
                flatNo: data.flatNo,
                wing: data.wing,
                phone: data.phone,
            },
        });
        residents.push(res);
    }
    console.log("Residents seeded.");

    // Notices
    await prisma.notice.createMany({
        data: [
            {
                title: "Upcoming Water Tank Cleaning",
                body: "The overhead water tanks will be cleaned this Saturday. Expect water supply interruptions between 10 AM and 2 PM.",
                isImportant: true,
                postedBy: admin.id,
            },
            {
                title: "Yoga Classes Starting",
                body: "Free yoga sessions for all residents every Sunday morning at the clubhouse.",
                isImportant: false,
                postedBy: admin.id,
            },
        ],
    });
    console.log("Notices seeded.");

    // 1. Open, recent, not overdue
    await prisma.complaint.create({
        data: {
            residentId: residents[0].id,
            category: "PLUMBING",
            description: "Leaking tap in the master bathroom.",
            priority: "LOW",
            status: "OPEN",
            history: {
                create: {
                    oldStatus: null,
                    newStatus: "OPEN",
                    changedBy: residents[0].id,
                    note: "Complaint raised",
                },
            },
        },
    });

    // 2. In Progress, recent, not overdue
    await prisma.complaint.create({
        data: {
            residentId: residents[1].id,
            category: "ELECTRICAL",
            description: "Short circuit in the kitchen wiring! Smells like burning plastic.",
            priority: "HIGH",
            status: "IN_PROGRESS",
            history: {
                create: [
                    { oldStatus: null, newStatus: "OPEN", changedBy: residents[1].id, note: "Complaint raised" },
                    { oldStatus: "OPEN", newStatus: "IN_PROGRESS", changedBy: admin.id, note: "Electrician dispatched immediately." },
                ],
            },
        },
    });

    // 3. Resolved - demonstrates full lifecycle + the resolved lock
    await prisma.complaint.create({
        data: {
            residentId: residents[2].id,
            category: "CLEANING",
            description: "Common corridor on the 3rd floor hasn't been cleaned in over a week.",
            priority: "MEDIUM",
            status: "RESOLVED",
            history: {
                create: [
                    { oldStatus: null, newStatus: "OPEN", changedBy: residents[2].id, note: "Complaint raised" },
                    { oldStatus: "OPEN", newStatus: "IN_PROGRESS", changedBy: admin.id, note: "Housekeeping notified" },
                    { oldStatus: "IN_PROGRESS", newStatus: "RESOLVED", changedBy: admin.id, note: "Cleaned and inspected" },
                ],
            },
        },
    });

    // 4. Overdue while OPEN — backdated 10 days
    await prisma.complaint.create({
        data: {
            residentId: residents[0].id,
            category: "SECURITY",
            description: "Main gate security camera has been non-functional for over a week.",
            priority: "HIGH",
            status: "OPEN",
            createdAt: daysAgo(10),
            updatedAt: daysAgo(10),
            history: {
                create: {
                    oldStatus: null,
                    newStatus: "OPEN",
                    changedBy: residents[0].id,
                    note: "Complaint raised",
                    createdAt: daysAgo(10),
                },
            },
        },
    });

    // 5. Overdue while IN_PROGRESS — backdated 12 days, proves overdue tracking
    //    survives a status change away from OPEN (not just status === "OPEN")
    await prisma.complaint.create({
        data: {
            residentId: residents[1].id,
            category: "STRUCTURAL",
            description: "Visible crack forming on the parking garage ceiling.",
            priority: "HIGH",
            status: "IN_PROGRESS",
            createdAt: daysAgo(12),
            updatedAt: daysAgo(9),
            history: {
                create: [
                    { oldStatus: null, newStatus: "OPEN", changedBy: residents[1].id, note: "Complaint raised", createdAt: daysAgo(12) },
                    { oldStatus: "OPEN", newStatus: "IN_PROGRESS", changedBy: admin.id, note: "Structural engineer scheduled to inspect", createdAt: daysAgo(9) },
                ],
            },
        },
    });

    // 6. Open, recent, not overdue — rounds out category coverage
    await prisma.complaint.create({
        data: {
            residentId: residents[2].id,
            category: "PARKING",
            description: "Visitor parking spot 12 has been occupied by an unregistered vehicle for 3 days.",
            priority: "LOW",
            status: "OPEN",
            history: {
                create: {
                    oldStatus: null,
                    newStatus: "OPEN",
                    changedBy: residents[2].id,
                    note: "Complaint raised",
                },
            },
        },
    });

    console.log("Complaints seeded.");
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });