import Editor from '../../components/editor';
import appStyles from '../app.module.scss';

export default function Home() {
    return (
        <div className={appStyles.content}>
            <Editor />
        </div>
    );
}
