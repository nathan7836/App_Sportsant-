
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreateUserForm } from "./create-user-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { PrismaClient } from "@prisma/client" // REMOVED
import { prisma } from "@/lib/prisma" // ADDED
import { User } from "@prisma/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// const prisma = new PrismaClient() // REMOVED

export default async function AdminUsersPage() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
                <p className="text-muted-foreground">Créer et gérer les comptes d'accès (Coachs & Admins).</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Créer un compte</CardTitle>
                        <CardDescription>Ajouter un nouveau membre à l'équipe.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateUserForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Utilisateurs existants</CardTitle>
                        <CardDescription>{users.length} comptes actifs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: User) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
