import { Loader } from 'lucide-react';
import styles from './spinner.module.scss';

export default function Spinner() {
    return (
        <div className='loader-container'>
            <Loader className='loader-spinner' />
        </div>
    );
}
