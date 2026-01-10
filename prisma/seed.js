
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@sportsante.com'
    const password = 'admin' // Simple password for initial setup
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

    console.log({ user })
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
