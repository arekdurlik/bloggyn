import { HydrateClient, trpc } from '@/trpc/server';
import Users from '../_components/results/users/users';

const LIMIT = 6;

export default async function UsersPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q;

    await trpc.user.getAll.prefetchInfinite({
        query,
        limit: LIMIT,
    });

    return (
        <HydrateClient>
            <Users query={query} limit={LIMIT} />
        </HydrateClient>
    );
}
