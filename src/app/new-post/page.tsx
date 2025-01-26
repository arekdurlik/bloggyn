import appStyles from '../app.module.scss';
import Editor from './_components';

export default function Home() {
    return (
        <div className={appStyles.content}>
            <Editor />
        </div>
    );
}
