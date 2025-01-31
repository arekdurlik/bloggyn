import Users from '@/components/results/users/users';
import Header from '../_components/header/header';

export default function UsersPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q;

    return (
        <div>
            <Header query={query} active="users" />
            <Users query={query} limit={6} />
        </div>
    );
}
