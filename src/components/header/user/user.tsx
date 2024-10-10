import Notifications from './notifications';
import Account from './account/account';
import styles from './user.module.scss';

export default function User() {
    return (
        <div className={styles.container}>
            <Notifications/>
            <Account/>
        </div>
    );
}
