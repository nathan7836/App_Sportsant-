
process.env.DATABASE_URL = "file:./dev.db";
console.log('Using DB URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@sportsante.com'
    const password = 'admin'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('Admin user verified:', user.email)

    // Seed Services
    await prisma.service.create({
        data: {
            name: 'Coaching Individuel',
            price: 60,
            durationMin: 60,
            type: 'INDIVIDUAL'
        }
    }).catch(() => { }) // Ignore if exists (unique constraint not set on name but good practice)

    await prisma.service.create({
        data: {
            name: 'Coaching Duo',
            price: 80,
            durationMin: 60,
            type: 'GROUP'
        }
    }).catch(() => { })
    console.log('Services seeded')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
