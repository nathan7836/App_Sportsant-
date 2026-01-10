
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.user.count({
            where: { role: 'ADMIN' }
        })
        console.log(`Admin count: ${count}`)

        if (count === 0) {
            // If no admin, try creating one directly here to be sure
            const bcrypt = require('bcryptjs')
            const hashedPassword = await bcrypt.hash('admin', 10)
            await prisma.user.create({
                data: {
                    email: 'admin@sportsante.com',
                    name: 'Super Admin',
                    role: 'ADMIN',
                    password: hashedPassword
                }
            })
            console.log('Admin created successfully via check script.')
        } else {
            console.log('Admin already exists.')
        }

    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
