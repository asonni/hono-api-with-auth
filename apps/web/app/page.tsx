import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Library Management Dashboard</CardTitle>
          <CardDescription>
            Welcome to the admin dashboard. Manage authors, books, and API keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This dashboard is under construction. Check back soon for full functionality.
          </p>
          <div className="flex gap-2">
            <Button>Manage Authors</Button>
            <Button variant="outline">Manage Books</Button>
            <Button variant="secondary">API Keys</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
