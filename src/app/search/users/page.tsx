import Users from '@/components/results/users/users';
import { HydrateClient, trpc } from '@/trpc/server';

const LIMIT = 6;

export default async function UsersPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q;

    await trpc.getUsers.prefetchInfinite({
        query,
        limit: LIMIT,
    });

    return (
        <HydrateClient>
            <Users query={query} limit={LIMIT} />
        </HydrateClient>
    );
}
