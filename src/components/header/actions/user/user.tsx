import { type Session } from 'next-auth';
import Account from './account/account';
import Notifications from './notifications';
import styles from './user.module.scss';

export default function User({
    session,
    unreadNotifications,
}: {
    session: Session;
    unreadNotifications: number;
}) {
    return (
        <div className={styles.container}>
            <Notifications unreadNotifications={unreadNotifications} />
            <Account session={session} />
        </div>
    );
}
