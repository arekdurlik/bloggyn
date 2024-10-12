import Notifications from './notifications';
import Account from './account/account';
import styles from './user.module.scss';
import { type Session } from 'next-auth';

export default function User({ session }: { session: Session }) {
    return (
        <div className={styles.container}>
            <Notifications />
            <Account session={session} />
        </div>
    );
}
