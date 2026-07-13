import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create Admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@society.com" },
        update: {},
        create: {
            name: "System Admin",
            email: "admin@society.com",
            passwordHash: adminPassword,
            role: "ADMIN",
        },
    });
    console.log("Admin seeded.");

    // Create Residents
    const resPassword = await bcrypt.hash("resident123", 10);
    const residentsData = [
        { name: "John Doe", email: "john@example.com", flatNo: "101", wing: "A", phone: "+91 9876543210" },
        { name: "Jane Smith", email: "jane@example.com", flatNo: "204", wing: "B", phone: "+91 8765432109" },
        { name: "Bob Johnson", email: "bob@example.com", flatNo: "305", wing: "A", phone: "+91 7654321098" },
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

    // Create Notices
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

    // Create some complaints
    const c1 = await prisma.complaint.create({
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

    const c2 = await prisma.complaint.create({
        data: {
            residentId: residents[1].id,
            category: "ELECTRICAL",
            description: "Short circuit in the kitchen wiring! Smells like burning plastic.",
            priority: "HIGH",
            status: "IN_PROGRESS",
            history: {
                create: [
                    { oldStatus: null, newStatus: "OPEN", changedBy: residents[1].id, note: "Complaint raised" },
                    { oldStatus: "OPEN", newStatus: "IN_PROGRESS", changedBy: admin.id, note: "Electrician dispatched immediately." }
                ],
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
